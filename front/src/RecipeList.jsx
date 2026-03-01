import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecipeList = ({ onOpenRecipe }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Базовый URL твоего бэкенда
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    axios.get(`${API_URL}/recipes/`)
      .then(res => {
        setRecipes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-lg">Рецептов пока нет. Самое время что-нибудь приготовить! 👨‍🍳</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Моя кулинарная книга</h2>
      
      {/* Сетка карточек: 1 колонка на мобилках, 2 на планшетах, 3 на десктопе */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id} 
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Блок с изображением */}
            <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
              {recipe.image ? (
                <img 
                  src={`${API_URL}/${recipe.image}`} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  Нет фото 🍳
                </div>
              )}
              {/* Бейдж с количеством порций (если есть в базе) */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                👤 {recipe.servings_default}
              </div>
            </div>

            {/* Контент карточки */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                {recipe.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                {recipe.instructions || "Инструкции не добавлены..."}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  Ингредиентов: {recipe.ingredients?.length || 0}
                </span>
                
                <button 
                  onClick={() => onOpenRecipe(recipe.id)}
                  className="text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-green-100"
                >
                  Смотреть
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;