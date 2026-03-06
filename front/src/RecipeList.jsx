import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecipeList = ({ onOpenRecipe }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  
  const API_URL = process.env.NODE_ENV === 'development' 
  ? "http://127.0.0.1:8000" 
  : window.location.origin;

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

  // Фильтрация рецептов на лету
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#64748b', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
      Загрузка вашей коллекции...
    </div>
  );

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      minHeight: '100vh', 
      padding: '40px 20px 80px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      
      {/* Декоративное свечение */}
      <div style={{
        position: 'absolute', top: '-5%', right: '-5%', width: '400px', height: '400px',
        background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Шапка */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{ 
            textTransform: 'uppercase', letterSpacing: '3px', fontSize: '11px', 
            fontWeight: '800', color: '#10b981', display: 'block', marginBottom: '10px' 
          }}>
            Chef's Collection
          </span>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#0f172a', margin: '0', letterSpacing: '-1px' }}>
            Ваши Рецепты
          </h2>
        </header>

        {/* СТРОКА ПОИСКА */}
        <div style={{ maxWidth: '500px', margin: '0 auto 60px', position: 'relative' }}>
          <input 
            type="text"
            placeholder="Найти рецепт по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 20px 16px 50px', borderRadius: '22px', 
              border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)', fontSize: '16px', outline: 'none', color: '#1e293b',
              transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.12)';
              e.target.style.backgroundColor = '#fff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
          <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.4 }}>🔍</span>
        </div>

        {/* Сетка */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '35px', width: '100%' 
        }}>
          {filteredRecipes.map((recipe) => (
            <div 
              key={recipe.id}
              onMouseEnter={() => setHoveredId(recipe.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpenRecipe(recipe.id)}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '30px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', height: '420px', cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.2, 1, 0.2, 1)', border: '1px solid #fff',
                boxShadow: hoveredId === recipe.id 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                transform: hoveredId === recipe.id ? 'translateY(-10px)' : 'none'
              }}
            >
              {/* Картинка */}
              <div style={{ height: '220px', width: '100%', overflow: 'hidden', flexShrink: 0 }}>
                {recipe.image ? (
                  <img 
                    src={`${API_URL}/${recipe.image}`} 
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 0.8s ease',
                      transform: hoveredId === recipe.id ? 'scale(1.12)' : 'scale(1)'
                    }} 
                    alt={recipe.title}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontSize: '40px' }}>🥘</div>
                )}
              </div>

              {/* Контент */}
              <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#1e293b',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {recipe.title}
                </h3>
                
                <p style={{ 
                  color: '#64748b', fontSize: '14px', lineHeight: '1.6', flexGrow: 1, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {recipe.instructions || "Нажмите, чтобы увидеть рецепт..."}
                </p>

                <div style={{ 
                  marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: '800', fontSize: '13px'
                }}>
                  СМОТРЕТЬ РЕЦЕПТ 
                  <span style={{ 
                    marginLeft: '8px', transition: 'transform 0.3s', 
                    transform: hoveredId === recipe.id ? 'translateX(5px)' : 'none' 
                  }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredRecipes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '18px' }}>
            Ничего не нашли... попробуйте другое слово 🥦
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;