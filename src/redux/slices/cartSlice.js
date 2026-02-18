// src/redux/slices/cartSlice.js - Add to cart action
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId, size, quantity } = action.payload;
      
      // Check if item already exists with same productId and size
      const existingItemIndex = state.items.findIndex(
        item => item.productId === productId && item.size === size
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push(action.payload);
      }
      
      // Update total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => 
        !(item.productId === action.payload.productId && item.size === action.payload.size)
      );
      
      // Update total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      
      const item = state.items.find(
        item => item.productId === productId && item.size === size
      );
      
      if (item) {
        item.quantity = quantity;
        
        // Update total
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;