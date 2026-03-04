from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
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
if not os.path.exists("media"):
    os.makedirs("media")

app = FastAPI()

# Настройка доступа с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Раздача картинок
@app.get("/media/{path:path}")
async def get_media_file(path: str):
    clean_path = path.replace("media/", "")
    file_path = os.path.join(BASE_DIR, "media", clean_path)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Файл не найден")

# Получение списка рецептов
@app.get("/recipes/")
def get_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

# Получение деталей одного рецепта
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

# Создание нового рецепта
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
        recipe_folder = os.path.join("media", f"recipe_{new_recipe.id}")
        os.makedirs(recipe_folder, exist_ok=True)
        file_ext = image.filename.split(".")[-1]
        file_location = os.path.join(recipe_folder, f"{uuid4()}.{file_ext}").replace("\\", "/")
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        new_recipe.image = file_location

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

# Обновление существующего рецепта
@app.put("/recipes/{recipe_id}")
async def update_recipe(
    recipe_id: int,
    title: str = Form(...),
    instructions: str = Form(...),
    servings_default: int = Form(...),
    ingredients: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    db_recipe.title = title
    db_recipe.instructions = instructions
    db_recipe.servings_default = servings_default

    if image and image.filename:
        recipe_folder = os.path.join("media", f"recipe_{recipe_id}")
        os.makedirs(recipe_folder, exist_ok=True)
        file_ext = image.filename.split(".")[-1]
        file_location = os.path.join(recipe_folder, f"{uuid4()}.{file_ext}").replace("\\", "/")
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_recipe.image = file_location

    db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == recipe_id).delete()
    ingredients_list = json.loads(ingredients)
    for ing in ingredients_list:
        db_ing = db.query(models.Ingredient).filter(models.Ingredient.name == ing["ingredient_name"]).first()
        if not db_ing:
            db_ing = models.Ingredient(name=ing["ingredient_name"])
            db.add(db_ing)
            db.flush()
        db.add(models.RecipeIngredient(recipe_id=recipe_id, ingredient_id=db_ing.id, amount=ing["amount"], unit=ing["unit"]))

    db.commit()
    return {"message": "Updated"}

# Удаление рецепта
@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe: raise HTTPException(status_code=404)
    recipe_folder = os.path.join("media", f"recipe_{recipe_id}")
    if os.path.exists(recipe_folder): shutil.rmtree(recipe_folder)
    db.delete(recipe)
    db.commit()
    return {"message": "Deleted"}