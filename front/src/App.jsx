import React, { useState } from 'react';
import AddRecipe from './AddRecipe';
import RecipeList from './RecipeList';
import RecipeDetail from './RecipeDetail';

function App() {
  const [view, setView] = useState('list'); 
  const [selectedId, setSelectedId] = useState(null);
  const [hoverBtn, setHoverBtn] = useState(null);

  const openRecipe = (id) => {
    setSelectedId(id);
    setView('detail');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* СОВРЕМЕННАЯ НАВИГАЦИЯ */}
      <nav style={{ 
        position: 'sticky', 
        top: '20px', 
        zIndex: 100, 
        margin: '0 auto',
        maxWidth: '1000px',
        padding: '0 20px'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(12px)', 
          borderRadius: '24px', 
          padding: '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', // Исправлено значение
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}>
          <h1 
            style={{ 
              fontSize: '20px', 
              fontWeight: '900', 
              color: '#10b981', 
              cursor: 'pointer', 
              margin: 0,
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => setView('list')}
          >
            <span style={{ fontSize: '24px' }}>🍳</span> MyRecipes
          </h1>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onMouseEnter={() => setHoverBtn('list')}
              onMouseLeave={() => setHoverBtn(null)}
              onClick={() => setView('list')}
              style={{ 
                padding: '10px 20px', 
                borderRadius: '16px', 
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: view === 'list' ? '#f0fdf4' : 'transparent',
                color: view === 'list' ? '#10b981' : '#64748b',
                transform: hoverBtn === 'list' ? 'scale(1.05)' : 'none'
              }}
            >
              Главная
            </button>

            <button 
              onMouseEnter={() => setHoverBtn('add')}
              onMouseLeave={() => setHoverBtn(null)}
              onClick={() => setView('add')}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '16px', 
                border: 'none',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: '#10b981',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                transform: hoverBtn === 'add' ? 'scale(1.05) translateY(-2px)' : 'none'
              }}
            >
              + Добавить
            </button>
          </div>
        </div>
      </nav>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main style={{ marginTop: '20px' }}>
        {view === 'list' && <RecipeList onOpenRecipe={openRecipe} />}
        
        {view === 'add' && (
          <div style={{ padding: '40px 20px' }}>
            <AddRecipe onSaved={() => setView('list')} />
          </div>
        )}
        
        {view === 'detail' && (
          <div style={{ padding: '40px 20px' }}>
            <RecipeDetail recipeId={selectedId} onBack={() => setView('list')} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;