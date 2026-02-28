from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


# 🔹 Схема для ингредиента внутри рецепта
class RecipeIngredientCreate(BaseModel):
    ingredient_name: str = Field(..., min_length=1)
    amount: float = Field(..., ge=0)  # >= 0
    unit: str = Field(..., min_length=1)

    @field_validator("ingredient_name", "unit")
    @classmethod
    def not_empty(cls, value: str):
        if not value.strip():
            raise ValueError("Поле не может быть пустым")
        return value


# 🔹 Схема для создания рецепта
class RecipeCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    instructions: str = Field(..., min_length=1)
    servings_default: int = Field(default=1, ge=1)
    ingredients: List[RecipeIngredientCreate]

    @field_validator("title", "instructions")
    @classmethod
    def not_empty(cls, value: str):
        if not value.strip():
            raise ValueError("Поле не может быть пустым")
        return value

    @field_validator("ingredients")
    @classmethod
    def must_have_ingredients(cls, value):
        if not value:
            raise ValueError("Рецепт должен содержать хотя бы один ингредиент")
        return value

    class Config:
        from_attributes = True