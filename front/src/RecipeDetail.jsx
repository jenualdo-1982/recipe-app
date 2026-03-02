import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecipeDetail = ({ recipeId, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    axios.get(`${API_URL}/recipes/${recipeId}`)
      .then(res => {
        setRecipe(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки рецепта:", err);
        setLoading(false);
      });
  }, [recipeId]);

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>⏳ Секундочку, достаем книгу рецептов...</div>
  );

  if (!recipe) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>Рецепт не найден 😕</div>
  );

  return (
    <div style={{ 
      background: '#f8fafc', minHeight: '100vh', padding: '20px', 
      fontFamily: '-apple-system, sans-serif' 
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Кнопка назад */}
        <button 
          onClick={onBack}
          style={{ 
            background: 'white', border: 'none', padding: '12px 20px', borderRadius: '15px',
            cursor: 'pointer', marginBottom: '20px', fontWeight: '700', color: '#10b981',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          ← К списку
        </button>

        <div style={{ 
          background: 'white', borderRadius: '40px', overflow: 'hidden', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)' 
        }}>
          
          {/* Главное фото */}
          <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            {recipe.image ? (
              <img 
                src={`${API_URL}/${recipe.image}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt={recipe.title}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontSize: '60px' }}>🥘</div>
            )}
            <div style={{ 
              position: 'absolute', bottom: '0', left: '0', right: '0', 
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', 
              padding: '40px', color: 'white' 
            }}>
              <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '900' }}>{recipe.title}</h1>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', opacity: 0.9 }}>
                <span>👥 {recipe.servings_default} порций</span>
                <span>⏱ Сложность: Шеф</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px' }}>
            
            {/* Левая колонка: Ингредиенты */}
            <aside>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Ингредиенты</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recipe.ingredients && recipe.ingredients.map((ing, index) => (
                  <div 
                    key={index}
                    onClick={() => toggleIngredient(index)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                      padding: '10px', borderRadius: '12px', transition: '0.2s',
                      background: checkedIngredients[index] ? '#f0fdf4' : 'transparent'
                    }}
                  >
                    <div style={{ 
                      width: '22px', height: '22px', borderRadius: '6px', 
                      border: '2px solid #10b981', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', transition: '0.2s',
                      background: checkedIngredients[index] ? '#10b981' : 'transparent'
                    }}>
                      {checkedIngredients[index] && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                    </div>
                    <span style={{ 
                      fontSize: '15px', color: checkedIngredients[index] ? '#94a3b8' : '#475569',
                      textDecoration: checkedIngredients[index] ? 'line-through' : 'none'
                    }}>
                      <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            {/* Правая колонка: Инструкции */}
            <main>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Приготовление</h3>
              <p style={{ 
                fontSize: '16px', lineHeight: '1.8', color: '#475569', 
                whiteSpace: 'pre-line', // Важно, чтобы сохранялись переносы строк
                backgroundColor: '#f8fafc', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9'
              }}>
                {recipe.instructions}
              </p>
            </main>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;