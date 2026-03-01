import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecipeDetail = ({ recipeId, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [targetServings, setTargetServings] = useState(0);
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    axios.get(`${API_URL}/recipes/${recipeId}`)
      .then(res => {
        setRecipe(res.data);
        setTargetServings(res.data.servings_default || 1);
      })
      .catch(err => console.error("Ошибка загрузки:", err));
  }, [recipeId]);

  if (!recipe) return <div className="p-10 text-center text-gray-500">Загрузка рецепта...</div>;

  // Математика пересчета порций
  const calculateAmount = (originalAmount) => {
    if (!recipe.servings_default || originalAmount === null) return originalAmount;
    const factor = targetServings / recipe.servings_default;
    return (originalAmount * factor).toFixed(1);
  };

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Кнопка назад */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors"
      >
        ← Назад к списку
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Заголовок и Фото */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{recipe.title}</h1>
        
        {recipe.image && (
          <img 
            src={`${API_URL}/${recipe.image}`} 
            className="w-full h-80 object-cover rounded-3xl shadow-lg mb-8"
            alt={recipe.title}
          />
        )}

        {/* Управление порциями */}
        <div className="bg-green-50 p-6 rounded-2xl mb-8 flex items-center justify-between border border-green-100">
          <div>
            <h4 className="font-bold text-green-800">Нужно порций:</h4>
            <p className="text-sm text-green-600">Ингредиенты пересчитаются автоматически</p>
          </div>
          <input 
            type="number" 
            value={targetServings} 
            min="1"
            onChange={(e) => setTargetServings(parseInt(e.target.value) || 1)}
            className="w-20 p-3 text-xl font-bold rounded-xl border-2 border-green-200 focus:border-green-500 outline-none text-center"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Список ингредиентов */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Ингредиенты</h3>
            <ul className="space-y-3">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg border-b border-gray-50">
                  <span className="text-gray-700 font-medium">{ing.name}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold text-gray-600">
                    {calculateAmount(ing.amount)} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Инструкции */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Инструкция</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap italic">
              {recipe.instructions || "Инструкция не предоставлена."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;