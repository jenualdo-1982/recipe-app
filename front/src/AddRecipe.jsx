import React, { useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const AddRecipe = () => {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState([
    { ingredient_name: "", amount: "", unit: "г", id: Date.now() },
  ]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const addField = () => {
    setIngredients([
      ...ingredients,
      { ingredient_name: "", amount: "", unit: "г", id: Date.now() },
    ]);
  };

  const removeField = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngChange = (index, field, value) => {
    const newIngs = [...ingredients];
    if (field === "amount") {
      if (value === "" || parseFloat(value) >= 0) newIngs[index][field] = value;
    } else {
      newIngs[index][field] = value;
    }
    setIngredients(newIngs);
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Введите название блюда";
    if (!instructions.trim())
      newErrors.instructions = "Введите инструкцию приготовления";

    ingredients.forEach((ing, index) => {
      if (!ing.ingredient_name.trim())
        newErrors[`ingredient_name_${index}`] = "Введите название ингредиента";
      if (ing.amount === "" || parseFloat(ing.amount) < 0)
        newErrors[`amount_${index}`] = "Количество должно быть больше 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("instructions", instructions);
      formData.append("servings_default", 1);
      formData.append("ingredients", JSON.stringify(ingredients));
      if (image) formData.append("image", image);

      const res = await axios.post("http://127.0.0.1:8000/recipes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Рецепт сохранен!");
      console.log(res.data);

      // сброс формы
      setTitle("");
      setInstructions("");
      setIngredients([{ ingredient_name: "", amount: "", unit: "г", id: Date.now() }]);
      setImage(null);
      setPreview(null);
      setErrors({});
    } catch (err) {
      alert("Ошибка соединения с сервером");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🍳 Добавить рецепт</h2>
      <form onSubmit={save}>
        {/* Название блюда */}
        <input
          placeholder="Название блюда"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        {errors.title && <div style={styles.error}>{errors.title}</div>}

        {/* Ингредиенты */}
        <div style={styles.section}>
          <h4>Ингредиенты</h4>
          {ingredients.map((ing, i) => (
            <div key={ing.id} style={styles.wrapper}>
              <div style={styles.row}>
                <input
                  placeholder="Что"
                  value={ing.ingredient_name}
                  onChange={(e) =>
                    handleIngChange(i, "ingredient_name", e.target.value)
                  }
                  style={styles.flex2}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Сколько"
                  value={ing.amount}
                  onChange={(e) =>
                    handleIngChange(i, "amount", e.target.value)
                  }
                  style={styles.flex1}
                />
                <input
                  placeholder="Ед. изм"
                  value={ing.unit}
                  onChange={(e) => handleIngChange(i, "unit", e.target.value)}
                  style={styles.flex1}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    style={styles.trashButton}
                    title="Удалить ингредиент"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {errors[`ingredient_name_${i}`] && (
                <div style={styles.error}>{errors[`ingredient_name_${i}`]}</div>
              )}
              {errors[`amount_${i}`] && (
                <div style={styles.error}>{errors[`amount_${i}`]}</div>
              )}
            </div>
          ))}
          <button type="button" onClick={addField} style={styles.addButton}>
            + Добавить еще
          </button>
        </div>

        {/* Фото */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            if (file) setPreview(URL.createObjectURL(file));
          }}
          style={{ marginBottom: "10px" }}
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              maxHeight: "250px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
        )}

        {/* Инструкция */}
        <textarea
          placeholder="Как готовить?"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          style={{ ...styles.input, height: "100px", resize: "none" }}
        />
        {errors.instructions && <div style={styles.error}>{errors.instructions}</div>}

        {/* Отправка */}
        <button type="submit" style={styles.saveButton}>
          Опубликовать
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    color: "#333",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  title: { textAlign: "center" },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  },
  section: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  wrapper: { marginBottom: "10px", position: "relative" },
  row: { display: "flex", gap: "8px", alignItems: "center", position: "relative" },
  flex2: { flex: 2, padding: "8px" },
  flex1: { flex: 1, padding: "8px" },
  addButton: { padding: "5px 10px", fontSize: "12px", cursor: "pointer", marginTop: "5px" },
  trashButton: {
    padding: "5px",
    fontSize: "16px",
    cursor: "pointer",
    background: "#ccc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    marginLeft: "5px",
  },
  saveButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: { color: "red", fontSize: "12px", marginBottom: "5px" },
};

export default AddRecipe;