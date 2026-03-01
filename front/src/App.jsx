import React, { useState } from 'react';
import AddRecipe from './AddRecipe';
import RecipeList from './RecipeList'; // Убедись, что этот импорт есть
import RecipeDetail from './RecipeDetail';

function App() {
  // МЕНЯЕМ ТУТ: по умолчанию ставим 'list'
  const [view, setView] = useState('list'); 
  const [selectedId, setSelectedId] = useState(null);

  const openRecipe = (id) => {
    setSelectedId(id);
    setView('detail');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 
            className="text-xl font-bold text-green-600 cursor-pointer"
            onClick={() => setView('list')}
          >
            🍳 MyRecipes
          </h1>
          <div className="space-x-4">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}
            >
              Главная
            </button>
            <button 
              onClick={() => setView('add')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Добавить рецепт
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4">
        {/* ЛОГИКА ПЕРЕКЛЮЧЕНИЯ */}
        {view === 'list' && <RecipeList onOpenRecipe={openRecipe} />}
        
        {view === 'add' && (
          <AddRecipe onSaved={() => setView('list')} />
        )}
        
        {view === 'detail' && (
          <RecipeDetail recipeId={selectedId} onBack={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;