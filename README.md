О проекте

Recipe App — это fullstack веб-приложение, в котором пользователь может:

Добавлять рецепты с фото

Динамически добавлять ингредиенты

Просматривать рецепты в виде карточек

Хранить данные в базе данных

Работать через REST API

Проект построен с разделением на Backend и Frontend и демонстрирует работу с формами, файлами, API и базой данных.

Технологический стек
Backend

FastAPI

SQLite

SQLAlchemy

Pydantic

python-multipart (загрузка файлов)

Frontend

React (Vite)

Axios

TailwindCSS

React Hooks (useState, useEffect)

Архитектура проекта

recipe-app/
├── back/          # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── media/     # загруженные изображения
│
├── front/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddRecipe.jsx
│   │   │   └── RecipesList.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│
└── README.md

Основной функционал

 Добавление рецепта

Динамические поля ингредиентов
Валидация формы
Превью загружаемого изображения
Отправка данных через FormData

 Отображение рецептов

Адаптивная сетка карточек
Отображение фото
Список ингредиентов

Запуск проекта локально

 Backend
 
cd back
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload

Backend будет доступен по адресу:

http://127.0.0.1:8000

Frontend

cd front
npm install
npm run dev

Frontend будет доступен по адресу:

http://localhost:5173

