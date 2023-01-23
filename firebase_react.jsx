import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';

const Product = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Initialize Firestore
  const firestore = firebase.firestore();

  // Create a new product
  const handleCreate = () => {
    firestore.collection('products').add({
      name,
      price,
    });
    setName('');
    setPrice(0);
  };

  // Read all products
  const handleRead = () => {
    firestore
      .collection('products')
      .get()
      .then((snapshot) => {
        const products = snapshot.docs.map((doc) => doc.data());
        setProducts(products);
      });
  };

  // Read all orders
  const handleReadOrders = () => {
    firestore
      .collection('orders')
      .get()
      .then((snapshot) => {
        const orders = snapshot.docs.map((doc) => doc.data());
        setOrders(orders);
      });
  };

  // Update a product
  const handleUpdate = (id) => {
    firestore.collection('products').doc(id).update({
      name,
      price,
    });
  };

  // Delete a product
  const handleDelete = (id) => {
    firestore.collection('products').doc(id).delete();
  };

  // Delete an order
  const handleDeleteOrder = (id) => {
    firestore.collection('orders').doc(id).delete();
  };

  const handleCreateOrder = (products, quantities, dates) => {
    let totalPrice = 0;
    const productsRef = products.map((product, index) => {
      const productRef = firestore.collection('products').doc(product.id);
      totalPrice += product.price * quantities[index];
      return {
        product: productRef,
        quantity: quantities[index],
        date: dates[index],
      };
    });
    firestore.collection('orders').add({ products: productsRef, totalPrice });
    setQuantity(1);
    setDate(new Date().toISOString());
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Product Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button onClick={handleCreate}>Create Product</button>
      <button onClick={handleRead}>Read Products</button>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => handleUpdate(product.id)}>Update</button>
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={() => handleAddProduct(product)}>
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleCreateOrder(cart, quantities, dates)}>
        Create Order
      </button>
    </div>
  );
};
