import React, { useReducer } from 'react';

const initialState = {
  products: [
    { id: 1, name: 'Product A', price: 10 },
    { id: 2, name: 'Product B', price: 20 },
    { id: 3, name: 'Product C', price: 30 },
  ],
  cart: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART':
      const product = state.products.find((p) => p.id === action.payload.id);
      return {
        ...state,
        cart: [...state.cart, { ...product, quantity: 1 }],
      };
    case 'REMOVE_FROM_CART':
      const cartItemIndex = state.cart.findIndex(
        (item) => item.id === action.payload.id
      );
      const updatedCart = [...state.cart];
      updatedCart.splice(cartItemIndex, 1);
      return {
        ...state,
        cart: updatedCart,
      };
    default:
      return state;
  }
}

function Products() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleAddToCart = (id) => {
    dispatch({ type: 'ADD_TO_CART', payload: { id } });
  };

  const handleRemoveFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  return (
    <>
      <h2>Products</h2>
      <ul>
        {state.products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => handleAddToCart(product.id)}>
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
      <h2>Cart</h2>
      <ul>
        {state.cart.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
            <button onClick={() => handleRemoveFromCart(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
