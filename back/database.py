from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Указываем, где будет лежать файл базы данных
SQLALCHEMY_DATABASE_URL = "sqlite:///./recipes.db"

# Создаем "двигатель". 
# check_same_thread=False нужен только для SQLite, чтобы FastAPI мог работать асинхронно.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Создаем фабрику сессий — это то, через что мы будем делать запросы
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Функция для получения доступа к БД в эндпоинтах
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()