import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminProductReducer from "./slices/adminProductSlice";
import cartReducer from "./slices/cartSlice"; // ✅ ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductReducer,
    cart: cartReducer, // ✅ AND THIS
  },
});

export default store;
