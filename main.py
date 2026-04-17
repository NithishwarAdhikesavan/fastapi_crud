from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from database import engine, SessionLocal, Base
from schemas import UserCreate, UserResponse

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# ✅ CORS (allow frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Create DB tables
Base.metadata.create_all(bind=engine)

# ✅ Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================== ROUTES ==================

# ✅ CREATE
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        name=user.name,
        email=user.email,
        age=user.age
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ✅ READ (single user)
@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ✅ READ ALL USERS (🔥 IMPORTANT ADDITION)
@app.get("/users/")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# ✅ UPDATE
@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updated_user: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = updated_user.name
    user.email = updated_user.email
    user.age = updated_user.age

    db.commit()
    db.refresh(user)
    return user


# ✅ DELETE
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# ================== FRONTEND ==================

# ✅ Serve frontend (must be LAST)
app.mount("/", StaticFiles(directory="static", html=True), name="static")