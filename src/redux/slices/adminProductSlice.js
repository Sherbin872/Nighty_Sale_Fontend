// src/redux/slices/adminProductSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productApi } from "../../api/productApi";
import axiosInstance from '../../api/axiosConfig';
// Async thunks
export const fetchProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async ({ keyword = "", pageNumber = 1 }, { rejectWithValue }) => {
    try {
      const response = await productApi.getProducts(keyword, pageNumber);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(productData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product",
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productApi.updateProduct(id, productData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product",
      );
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

// Add this if you don't have it already!
export const fetchProductById = createAsyncThunk(
  'adminProducts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch product');
    }
  }
);

export const uploadProductImages = createAsyncThunk(
  "adminProducts/uploadImages",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await productApi.uploadProductImages(formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload images"
      );
    }
  },
  {
    serializeError: false,
  }
);


const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  success: false,
  page: 1,
  pages: 1,
  total: 0,
};

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.error = null;
      state.success = false;
      state.product = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.products.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload);
        state.product = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload image
      .addCase(uploadProductImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProductImages.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to store uploaded images temporarily
      })
      .addCase(uploadProductImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ADD THESE CASES inside your extraReducers
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload; // <--- This is where the magic happens!
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductState, setPage } = adminProductSlice.actions;
export default adminProductSlice.reducer;
