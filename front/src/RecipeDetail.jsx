import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecipeDetail = ({ recipeId, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editTitle, setEditTitle] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editServings, setEditServings] = useState(1);
  const [editIngredients, setEditIngredients] = useState([]);
  const [editImage, setEditImage] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const API_URL = import.meta.env.MODE === 'development' 
  ? "http://127.0.0.1:8000" 
  : window.location.origin;
  const units = ['г', 'кг', 'мл', 'л', 'шт', 'ст. л.', 'ч. л.', 'стакан', 'по вкусу'];

  useEffect(() => { fetchRecipe(); }, [recipeId]);

  const fetchRecipe = () => {
    setLoading(true);
    axios.get(`${API_URL}/recipes/${recipeId}`)
      .then(res => {
        const data = res.data;
        setRecipe(data);
        setEditTitle(data.title);
        setEditInstructions(data.instructions);
        setEditServings(data.servings_default);
        setEditIngredients(data.ingredients.map(ing => ({
          name: ing.name, amount: ing.amount, unit: ing.unit
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const addIngredientField = () => setEditIngredients([...editIngredients, { name: '', amount: '', unit: 'г' }]);
  const removeIngredientField = (index) => setEditIngredients(editIngredients.filter((_, i) => i !== index));

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ СОХРАНЕНИЯ
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('instructions', editInstructions);
    formData.append('servings_default', editServings);
    formData.append('ingredients', JSON.stringify(editIngredients.map(i => ({
      ingredient_name: i.name, amount: parseFloat(i.amount) || 0, unit: i.unit
    }))));
    if (editImage) formData.append('image', editImage);

    try {
      // Заменили axios.put на axios.post и путь на /update
      await axios.post(`${API_URL}/recipes/${recipeId}/update`, formData);
      setIsEditing(false);
      fetchRecipe();
      alert("Рецепт успешно обновлен!");
    } catch (err) { 
      console.error(err);
      alert("Ошибка сохранения: " + (err.response?.data?.detail || err.message)); 
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Удалить рецепт "${recipe.title}"?`)) {
      try {
        await axios.delete(`${API_URL}/recipes/${recipeId}`);
        onBack();
      } catch { alert("Ошибка при удалении"); }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ Загрузка...</div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={onBack} style={btnStyle}>← Назад</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsEditing(!isEditing)} style={{ ...btnStyle, color: '#6366f1' }}>
              {isEditing ? "❌ Отмена" : "✏️ Редактировать"}
            </button>
            {!isEditing && (
              <button onClick={handleDelete} style={{ ...btnStyle, color: '#ef4444', background: '#fee2e2' }}>
                🗑 Удалить
              </button>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
          {isEditing ? (
            <div style={{ padding: '40px' }}>
              <h2 style={{ marginBottom: '20px' }}>Редактирование</h2>
              <label style={labelStyle}>Название</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Количество порций</label>
              <input type="number" value={editServings} onChange={e => setEditServings(e.target.value)} style={inputStyle} />
              <label style={labelStyle}>Ингредиенты</label>
              {editIngredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input placeholder="Продукт" value={ing.name} onChange={e => {
                    const n = [...editIngredients]; n[idx].name = e.target.value; setEditIngredients(n);
                  }} style={{ ...inputStyle, flex: '3', marginBottom: 0 }} />
                  <input type="number" placeholder="К-во" value={ing.amount} onChange={e => {
                    const n = [...editIngredients]; n[idx].amount = e.target.value; setEditIngredients(n);
                  }} style={{ ...inputStyle, flex: '1', marginBottom: 0 }} />
                  <select value={ing.unit} onChange={e => {
                    const n = [...editIngredients]; n[idx].unit = e.target.value; setEditIngredients(n);
                  }} style={{ ...inputStyle, flex: '1.2', marginBottom: 0 }}>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={() => removeIngredientField(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>
              ))}
              <button onClick={addIngredientField} style={{ width: '100%', padding: '10px', marginBottom: '20px', cursor: 'pointer', borderRadius: '10px', border: '1px dashed #ccc' }}>+ Добавить строку</button>
              <label style={labelStyle}>Инструкции</label>
              <textarea value={editInstructions} onChange={e => setEditInstructions(e.target.value)} style={{ ...inputStyle, height: '150px' }} />
              <label style={labelStyle}>Сменить фото</label>
              <input type="file" onChange={e => setEditImage(e.target.files[0])} style={{ marginBottom: '20px' }} />
              <button onClick={handleSave} style={{ ...btnStyle, background: '#10b981', color: 'white', width: '100%', padding: '18px' }}>💾 Сохранить изменения</button>
            </div>
          ) : (
            <>
              <div style={{ height: '350px', position: 'relative' }}>
                {recipe.image ? <img src={`${API_URL}/${recipe.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ height: '100%', background: '#f1f5f9' }} />}
                <div style={{ position: 'absolute', bottom: 0, padding: '40px', color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', width: '100%' }}>
                  <h1 style={{ margin: 0 }}>{recipe.title}</h1>
                </div>
              </div>
              <div style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '12px 20px', borderRadius: '20px', width: 'fit-content', marginBottom: '30px' }}>
                   <span style={{ color: '#166534', fontWeight: 'bold' }}>🍽️ Порций: {recipe.servings_default}</span> 
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
                  <aside>
                    <h3 style={labelStyle}>Ингредиенты</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} onClick={() => setCheckedIngredients({...checkedIngredients, [idx]: !checkedIngredients[idx]})} style={{ cursor: 'pointer', opacity: checkedIngredients[idx] ? 0.4 : 1, transition: '0.2s' }}>
                            {checkedIngredients[idx] ? '✅' : '⬜'} <b style={{ color: '#10b981' }}>{ing.amount} {ing.unit}</b> — {ing.name}
                        </div>
                        ))}
                    </div>
                  </aside>
                  <main style={{ overflow: 'hidden' }}>
                    <h3 style={labelStyle}>Приготовление</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#475569', background: '#f8fafc', padding: '20px', borderRadius: '20px', wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                      {recipe.instructions}
                    </p>
                  </main>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const btnStyle = { background: 'white', border: 'none', padding: '12px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' };

export default RecipeDetail;