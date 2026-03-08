from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Проверяем, запущены ли мы на сервере Amvera или локально
if os.path.exists("/data"):
    # Путь для Amvera (хранилище /data)
    SQLALCHEMY_DATABASE_URL = "sqlite:////data/recipes.db"
else:
    # Путь для локальной разработки
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