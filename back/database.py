from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Проверяем, запущены ли мы на сервере Amvera или локально
if os.path.exists("/data"):
    # Путь для Amvera (хранилище, которое не стирается)
    # Используем 4 слэша для абсолютного пути в SQLite
    SQLALCHEMY_DATABASE_URL = "sqlite:////data/recipes.db"
else:
    # Путь для локальной разработки (в папке проекта)
    SQLALCHEMY_DATABASE_URL = "sqlite:///./recipes.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()