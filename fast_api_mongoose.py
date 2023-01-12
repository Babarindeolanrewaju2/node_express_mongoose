from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
products = db["products"]
orders = db["orders"]

class Product(BaseModel):
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    product_id: str
    quantity: int
    user: str

@app.post("/products/")
async def create_product(product: Product):
    product_id = products.insert_one(product.dict()).inserted_id
    return JSONResponse(content={"product_id": str(product_id)})

@app.get("/products/{product_id}")
async def read_product(product_id: str):
    product = products.find_one({"_id": product_id})
    return JSONResponse(content=product)

@app.put("/products/{product_id}")
async def update_product(product_id: str, product: Product):
    products.update_one({"_id": product_id}, {"$set": product.dict()})
    return JSONResponse(content={"status": "success"})

@app.delete("/products/{product_id}")
async def delete_product(product_id: str):
    products.delete_one({"_id": product_id})
    return JSONResponse(content={"status": "success"})

@app.post("/orders/")
async def create_order(order: Order):
    order_id = orders.insert_one(order.dict()).inserted_id
    return JSONResponse(content={"order_id": str(order_id)})

@app.get("/orders/{user}")
async def read_order(user: str):
    order = orders.find({"user": user})
    return JSONResponse(content=list(order))

@app.put("/orders/{order_id}")
async def update_order(order_id: str, order: Order):
    orders.update_one({"_id": order_id}, {"$set": order.dict()})
    return JSONResponse(content={"status": "success"})

@app.delete("/orders/{order_id}")
async def delete_order(order_id: str):
    orders.delete_one({"_id": order_id})
    return JSONResponse(content={"status": "success"})


import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

from main import app, products, orders

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def setup_module(module):
    client = MongoClient("mongodb://localhost:27017/")
    db = client["mydatabase"]
    products.drop()
    orders.drop()

def test_create_product(client):
    data = {"name": "testproduct", "price": 10, "quantity": 5}
    response = client.post("/products/", json=data)
    assert response.status_code == 200
    assert "product_id" in response.json()

def test_read_product(client):
    data = {"name": "testproduct", "price": 10, "quantity": 5}
    response = client.post("/products/", json=data)
    product_id = response.json()["product_id"]
    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "testproduct"

def test_update_product(client):
    data = {"name": "testproduct", "price": 10, "quantity": 5}
    response = client.post("/products/", json=data)
    product_id = response.json()["product_id"]
    data = {"name": "updatedproduct", "price": 15, "quantity": 10}
    response = client.put(f"/products/{product_id}", json=data)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    response = client.get(f"/products/{product_id}")
    assert response.json()["name"] == "updatedproduct"

def test_delete_product(client):
    data = {"name": "testproduct", "price": 10, "quantity": 5}
    response = client.post("/products/", json=data)
    product_id = response.json()["product_id"]
    response = client.delete(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    response = client.get(f"/products/{product_id}")
    assert response.status_code == 404

# similar test cases for orders
