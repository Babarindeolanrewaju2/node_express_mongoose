from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import Depends
from fastapi import status
from pymongo import MongoClient
from passlib.context import CryptContext
from fastapi import Header
from jose import JWTError, jwt

app = FastAPI()

# mongodb setup
client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
users_collection = db["users"]

# password hasing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT setup
secret_key = "secret_key"

# User registration
class UserRegistration(BaseModel):
    username: str
    password: str

@app.post("/register/")
async def register(user: UserRegistration):
    if users_collection.count_documents({"username": user.username}) != 0:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_password})
    return {"status": "success", "username": user.username}

# User login
class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login/")
async def login(user: UserLogin):
    registered_user = users_collection.find_one({"username": user.username})
    if registered_user is None:
        raise HTTPException(status_code=400, detail="Username not found")
    if not pwd_context.verify(user.password, registered_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    access_token = jwt.encode({"sub": user.username}, secret_key, algorithm='HS256')
    return {"access_token": access_token, "token_type": "Bearer"}

#Access protected resource
@app.get("/items/")
async def read_items(token: str = Header(None)):
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    registered_user = users_collection.find_one({"username": username})
    if registered_user is None:
        raise HTTPException(status_code=400, detail="User not found")
    return {"items": [{"item": "Foo"}, {"item": "Bar"}]}
