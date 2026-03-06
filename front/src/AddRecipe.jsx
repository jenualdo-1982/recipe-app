import React, { useState } from 'react';
import axios from 'axios';

const AddRecipe = ({ onSaved }) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState(1); // Значение по умолчанию
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: 'г' }]); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(null);

  const API_URL = process.env.NODE_ENV === 'development' 
  ? "http://127.0.0.1:8000" 
  : window.location.origin;
  const units = ['г', 'кг', 'мл', 'л', 'шт', 'ст. л.', 'ч. л.', 'стакан', 'по вкусу'];

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: 'г' }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('instructions', instructions);
    formData.append('servings_default', servings); 

    // Форматируем ингредиенты в массив объектов и превращаем в JSON-строку
    const formattedIngredients = ingredients
      .filter(i => i.name.trim() !== '')
      .map(i => ({
        ingredient_name: i.name, // Ключ должен совпадать с ing["ingredient_name"] в main.py
        amount: parseFloat(i.amount) || 0,
        unit: i.unit
      }));
    
    formData.append('ingredients', JSON.stringify(formattedIngredients));
    
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post(`${API_URL}/recipes/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSaved(); // Возврат к списку при успехе
    } catch (err) {
      console.error("Ошибка при отправке:", err.response?.data);
      alert("Ошибка: " + JSON.stringify(err.response?.data?.detail || "Проверьте заполнение полей"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ 
        width: '100%', maxWidth: '750px', backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(20px)', borderRadius: '35px', padding: '40px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #fff', boxSizing: 'border-box'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: '35px' }}>Новый рецепт</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 3 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Название</label>
              <input 
                type="text" required placeholder="Напр: Курица Карри"
                value={title} onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Порции</label>
              <input 
                type="number" required min="1"
                value={servings} onChange={(e) => setServings(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Ингредиенты</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ingredients.map((ing, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    placeholder="Продукт" required
                    value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    style={{ flex: 3, padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none' }}
                  />
                  <input 
                    type="number" step="0.1" placeholder="К-во" required
                    value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', width: '60px' }}
                  />
                  <select 
                    value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    style={{ flex: 1.2, padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', cursor: 'pointer' }}
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredientField(index)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '8px' }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredientField} style={{ marginTop: '12px', background: '#f0fdf4', border: '1px dashed #10b981', color: '#10b981', padding: '10px', borderRadius: '12px', width: '100%', fontWeight: '700', cursor: 'pointer' }}>
              + Добавить ингредиент
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Инструкции</label>
            <textarea 
              required rows="5" placeholder="Опишите процесс приготовления..."
              value={instructions} onChange={(e) => setInstructions(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ padding: '20px', border: '2px dashed #e2e8f0', borderRadius: '20px', textAlign: 'center' }}>
            <label style={{ cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>
              <span style={{ display: 'block', fontSize: '24px', marginBottom: '5px' }}>📸</span>
              {image ? image.name : "Нажмите, чтобы загрузить фото"}
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'none' }} />
            </label>
          </div>

          <button 
            type="submit" disabled={loading}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ 
              padding: '18px', borderRadius: '22px', border: 'none', backgroundColor: '#10b981', color: 'white', 
              fontSize: '18px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: hover ? '0 15px 30px rgba(16, 185, 129, 0.3)' : '0 5px 15px rgba(16, 185, 129, 0.1)',
              transform: hover ? 'translateY(-3px)' : 'none',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Сохранение..." : "Опубликовать рецепт"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;