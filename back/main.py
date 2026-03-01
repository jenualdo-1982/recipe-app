from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
import models, schemas
from database import get_db, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uuid import uuid4
from PIL import Image
import os
import json
import shutil

# 1. Создаем таблицы в БД
models.Base.metadata.create_all(bind=engine)

# 2. Создаем папку media, если её нет
if not os.path.exists("media"):
    os.makedirs("media")

app = FastAPI()

# 3. Раздача медиа-файлов
app.mount("/media", StaticFiles(directory="media"), name="media")

# 4. Настройка CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ЭНДПОИНТЫ ---

# 🔹 1. Получить все рецепты (список)
@app.get("/recipes/")
def get_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

# 🔹 2. Получить один рецепт (ДЛЯ КАРТОЧКИ)
@app.get("/recipes/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    # Эти принты появятся в терминале VS Code при нажатии кнопки "Смотреть"
    print(f"--- Запрос на рецепт ID: {recipe_id} ---")
    
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    
    if not recipe:
        print(f"--- ОШИБКА: Рецепт {recipe_id} не найден ---")
        raise HTTPException(status_code=404, detail="Рецепт не найден")
    
    print(f"--- УСПЕХ: Отправляем рецепт {recipe.title} ---")
    
    return {
        "id": recipe.id,
        "title": recipe.title,
        "instructions": recipe.instructions,
        "servings_default": recipe.servings_default,
        "image": recipe.image,
        "ingredients": [
            {
                "name": ri.ingredient.name,
                "amount": ri.amount,
                "unit": ri.unit
            } for ri in recipe.ingredients
        ]
    }

# 🔹 3. Создание рецепта
@app.post("/recipes/")
async def create_recipe(
    title: str = Form(...),
    instructions: str = Form(...),
    servings_default: int = Form(...),
    ingredients: str = Form(...),  
    image: UploadFile = File(None),  
    db: Session = Depends(get_db)
):
    new_recipe = models.Recipe(
        title=title,
        instructions=instructions,
        servings_default=servings_default
    )
    db.add(new_recipe)
    db.flush() 

    if image:
        recipe_folder = os.path.join("media", f"recipe_{new_recipe.id}")
        os.makedirs(recipe_folder, exist_ok=True)

        file_ext = image.filename.split(".")[-1]
        unique_name = f"{uuid4()}.{file_ext}"
        file_location = os.path.join(recipe_folder, unique_name).replace("\\", "/")

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        try:
            img = Image.open(file_location)
            img.thumbnail((1000, 1000))
            img.save(file_location, optimize=True, quality=80)
        except Exception as e:
            print(f"Ошибка сжатия фото: {e}")

        new_recipe.image = file_location

    ingredients_list = json.loads(ingredients)
    for ing in ingredients_list:
        db_ingredient = db.query(models.Ingredient).filter(
            models.Ingredient.name == ing["ingredient_name"]
        ).first()

        if not db_ingredient:
            db_ingredient = models.Ingredient(name=ing["ingredient_name"])
            db.add(db_ingredient)
            db.flush()

        recipe_ing = models.RecipeIngredient(
            recipe_id=new_recipe.id,
            ingredient_id=db_ingredient.id,
            amount=ing["amount"],
            unit=ing["unit"]
        )
        db.add(recipe_ing)

    db.commit()
    return {"message": "Рецепт создан!", "id": new_recipe.id}