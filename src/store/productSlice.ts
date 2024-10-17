import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (page: number = 0) => {
    const response = await axios.get(`https://dummyjson.com/products?skip=${page * 7}`);
    return response.data.products;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [] as Array<any>,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.products = [...state.products, ...action.payload];
      state.loading = false;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to fetch products';
      state.loading = false;
    });
  },
});

export default productSlice.reducer;