from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, schemas
from database import get_db, engine
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import os
import json
import shutil

# Инициализация таблиц и папок
models.Base.metadata.create_all(bind=engine)

# Настройка путей относительно расположения этого файла (back/main.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Путь к папке back
ROOT_DIR = os.path.dirname(BASE_DIR)                  # Корень проекта
MEDIA_DIR = os.path.join(ROOT_DIR, "data", "media")   # Медиа в persistent хранилище
FRONTEND_DIR = os.path.join(ROOT_DIR, "front")        # Путь к папке front

# Создаем папку media, если её нет
if not os.path.exists(MEDIA_DIR):
    os.makedirs(MEDIA_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ЭНДПОИНТЫ ---

@app.get("/media/{path:path}")
async def get_media_file(path: str):
    file_path = os.path.join(MEDIA_DIR, path)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Файл не найден")

@app.get("/recipes/")
def get_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

@app.get("/recipes/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    return {
        "id": recipe.id,
        "title": recipe.title,
        "instructions": recipe.instructions,
        "servings_default": recipe.servings_default,
        "image": recipe.image,
        "ingredients": [
            {"name": ri.ingredient.name, "amount": ri.amount, "unit": ri.unit} 
            for ri in recipe.ingredients
        ]
    }

@app.post("/recipes/")
async def create_recipe(
    title: str = Form(...),
    instructions: str = Form(...),
    servings_default: int = Form(...),
    ingredients: str = Form(...),  
    image: UploadFile = File(None),  
    db: Session = Depends(get_db)
):
    new_recipe = models.Recipe(title=title, instructions=instructions, servings_default=servings_default)
    db.add(new_recipe)
    db.flush() 

    if image:
        recipe_folder = os.path.join(MEDIA_DIR, f"recipe_{new_recipe.id}")
        os.makedirs(recipe_folder, exist_ok=True)
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_ext}"
        file_location = os.path.join(recipe_folder, file_name)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        # Сохраняем относительный путь для API
        new_recipe.image = f"media/recipe_{new_recipe.id}/{file_name}"

    ingredients_list = json.loads(ingredients)
    for ing in ingredients_list:
        db_ing = db.query(models.Ingredient).filter(models.Ingredient.name == ing["ingredient_name"]).first()
        if not db_ing:
            db_ing = models.Ingredient(name=ing["ingredient_name"])
            db.add(db_ing)
            db.flush()
        db.add(models.RecipeIngredient(recipe_id=new_recipe.id, ingredient_id=db_ing.id, amount=ing["amount"], unit=ing["unit"]))

    db.commit()
    return {"id": new_recipe.id}

# (Остальные методы PUT и DELETE остаются прежними, просто используйте MEDIA_DIR для путей)

# --- РАЗДАЧА ФРОНТЕНДА ---

# 1. Монтируем статику (сборка React/Vite обычно создает папку assets)
assets_path = os.path.join(FRONTEND_DIR, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# 2. Главная страница и SPA-роутинг
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Исключаем API и документацию из перехвата
    if full_path.startswith(("recipes", "docs", "openapi.json", "media")):
        raise HTTPException(status_code=404)
    
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"detail": "Frontend index.html not found"}