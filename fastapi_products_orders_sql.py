from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import select, join

app = FastAPI()
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float, index=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, index=True)
    quantity = Column(Integer, index=True)

# Connect to the database
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

# Create a database session
session = Session(bind=engine)

# Create Product
@app.post("/products/")
async def create_product(product: Product):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product.id

# Read Product
@app.get("/products/{product_id}")
async def read_product(product_id: int):
    product = session.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.id

# Update Product
@app.put("/products/{product_id}")
async def update_product(product_id: int, product: Product):
    stored_product = session.query(Product).filter(Product.id == product_id).first()
    if stored_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    stored_product.name = product.name
    stored_product.price = product.price
    session.commit()
    return stored_product

# Delete Product
@app.delete("/products/{product_id}")
async def delete_product(product_id: int):
    product = session.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted"}

# Create Order
@app.post("/orders/")
async def create_order(order: Order):
    stored_product = session.query(Product).filter(Product.id == order.product_id).first()
    if stored_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    session.add(order)
    session.commit()

@app.get("/orders/{order_id}")
async def read_order(order_id: int):
    order = session.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.put("/orders/{order_id}")
async def update_order(order_id: int, order: Order):
    stored_order = session.query(Order).filter(Order.id == order_id).first()
    if stored_order is None:
        raise HTTPException(status_code=404, detail="Order not found")  
    stored_order.quantity = order.quantity
    session.commit()
    return stored_order

@app.delete("/orders/{order_id}")
async def delete_order(order_id: int):
    order = session.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    session.delete(order)
    session.commit()
    return {"message": "Order deleted"}

#Read Order with Product
@app.get("/orders/{order_id}")
async def read_order_with_product(order_id: int):
    order_product_join = join(Order, Product, Order.product_id == Product.id)
    query = select([Order, Product]).select_from(order_product_join).where(Order.id == order_id)
    result = session.execute(query).fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Order not found")
    order, product = result
    return {"order_id": order.id, "product_id": product.id, "product_name": product.name, "product_price": product.price, "quantity": order.quantity }

