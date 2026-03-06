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

# Инициализация БД
models.Base.metadata.create_all(bind=engine)

# Настройка путей Amvera
# /data — это примонтированный диск, который не стирается
MEDIA_DIR = "/data/media"
if not os.path.exists(MEDIA_DIR):
    os.makedirs(MEDIA_DIR)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Папка front находится в корне проекта, на одном уровне с back
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "front")

# --- API ЭНДПОИНТЫ ---

# Раздача картинок из постоянного хранилища
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

    if image and image.filename:
        # Сохраняем в /data/media/recipe_ID
        recipe_folder = os.path.join(MEDIA_DIR, f"recipe_{new_recipe.id}")
        os.makedirs(recipe_folder, exist_ok=True)
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_ext}"
        file_location = os.path.join(recipe_folder, file_name)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # В БД сохраняем относительный путь для эндпоинта /media/
        new_recipe.image = f"recipe_{new_recipe.id}/{file_name}"

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

# Удаление рецепта (с удалением фото)
@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe: raise HTTPException(status_code=404)
    
    recipe_folder = os.path.join(MEDIA_DIR, f"recipe_{recipe_id}")
    if os.path.exists(recipe_folder): 
        shutil.rmtree(recipe_folder)
        
    db.delete(recipe)
    db.commit()
    return {"message": "Deleted"}

# --- ПОДКЛЮЧЕНИЕ ФРОНТЕНДА ---

# Раздача статики (JS, CSS)
assets_path = os.path.join(FRONTEND_DIR, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Главный роут для SPA
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Пропускаем запросы к API и медиа
    if full_path.startswith(("recipes", "docs", "media", "openapi.json", "assets")):
        raise HTTPException(status_code=404)
    
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend files not found", "path_attempted": index_path}