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

# 2. Инициализация папки для медиа (Автоматическое создание при старте)
MEDIA_ROOT = "media"
if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

app = FastAPI()

# 3. Раздача медиа-файлов (чтобы браузер мог открыть картинку по ссылке)
app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")

# Список разрешенных адресов для CORS
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

# 🔹 Получить все рецепты
@app.get("/recipes/")
def get_recipes(db: Session = Depends(get_db)):
    # Возвращаем все поля, включая путь к картинке 'image'
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
    # 1️⃣ Создаем объект рецепта
    new_recipe = models.Recipe(
        title=title,
        instructions=instructions,
        servings_default=servings_default
    )
    db.add(new_recipe)
    db.flush()  # Получаем ID без закрытия транзакции

    image_path = None

    # 2️⃣ Сохраняем и обрабатываем фото
    if image:
        # Индивидуальная папка для рецепта
        recipe_folder = os.path.join(MEDIA_ROOT, f"recipe_{new_recipe.id}")
        os.makedirs(recipe_folder, exist_ok=True)

        # Генерация уникального имени
        file_ext = image.filename.split(".")[-1]
        unique_name = f"{uuid4()}.{file_ext}"
        file_location = os.path.join(recipe_folder, unique_name)

        # Сохранение файла из памяти на диск
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Оптимизация изображения через Pillow
        try:
            img = Image.open(file_location)
            img.thumbnail((1000, 1000))  # Ограничение размера
            img.save(file_location, optimize=True, quality=80)
        except Exception as e:
            print(f"Ошибка при обработке изображения: {e}")

        # Сохраняем путь в базу данных (используем прямой слэш для URL)
        image_path = file_location.replace("\\", "/")
        new_recipe.image = image_path

    # 3️⃣ Обработка ингредиентов
    try:
        ingredients_list = json.loads(ingredients)
        for ing in ingredients_list:
            # Ищем ингредиент или создаем новый
            db_ingredient = db.query(models.Ingredient).filter(
                models.Ingredient.name == ing["ingredient_name"]
            ).first()

            if not db_ingredient:
                db_ingredient = models.Ingredient(name=ing["ingredient_name"])
                db.add(db_ingredient)
                db.flush()

            # Связываем через промежуточную таблицу
            recipe_ing = models.RecipeIngredient(
                recipe_id=new_recipe.id,
                ingredient_id=db_ingredient.id,
                amount=ing["amount"],
                unit=ing["unit"]
            )
            db.add(recipe_ing)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Ошибка в формате ингредиентов: {e}")

    db.commit()

    return {
        "message": "Рецепт создан!",
        "id": new_recipe.id,
        "image_url": f"http://127.0.0.1:8000/{image_path}" if image_path else None
    }