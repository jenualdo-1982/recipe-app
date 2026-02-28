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

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# Раздача медиа-файлов
app.mount("/media", StaticFiles(directory="media"), name="media")

# Список разрешенных адресов для CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Получить все рецепты
@app.get("/recipes/")
def get_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()


# 🔹 Создание рецепта с фото
@app.post("/recipes/")
async def create_recipe(
    title: str = Form(...),
    instructions: str = Form(...),
    servings_default: int = Form(...),
    ingredients: str = Form(...),  # JSON строка ингредиентов
    image: UploadFile = File(None),  # необязательный файл
    db: Session = Depends(get_db)
):
    # 1️⃣ создаем рецепт без фото
    new_recipe = models.Recipe(
        title=title,
        instructions=instructions,
        servings_default=servings_default
    )
    db.add(new_recipe)
    db.flush()  # чтобы получить ID рецепта

    image_path = None

    # 2️⃣ сохраняем фото, если есть
    if image:
        # папка для каждого рецепта
        recipe_folder = f"media/recipe_{new_recipe.id}"
        os.makedirs(recipe_folder, exist_ok=True)

        # уникальное имя файла
        file_ext = image.filename.split(".")[-1]
        unique_name = f"{uuid4()}.{file_ext}"
        file_location = f"{recipe_folder}/{unique_name}"

        # сохраняем временно
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # сжимаем изображение
        img = Image.open(file_location)
        img.thumbnail((1000, 1000))  # макс 1000px
        img.save(file_location, optimize=True, quality=80)

        image_path = file_location
        new_recipe.image = image_path

    # 3️⃣ обработка ингредиентов
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

    return {
        "message": "Рецепт создан!",
        "image_url": f"http://127.0.0.1:8000/{image_path}" if image_path else None
    }