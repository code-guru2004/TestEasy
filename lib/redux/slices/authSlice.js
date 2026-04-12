// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 LOGIN API
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, thunkAPI) => {
    try {
        //console.log("Logging in with:", formData);
        
      const res = await axios.post("/api/login", formData);
      
      //console.log("Login response status:", res.data);
      

      if (!res.data.success) throw new Error(res.data.message);

      localStorage.setItem("token", res.data.token);

      return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message || err.message
          );
    }
  }
);

// 🔥 REGISTER API
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(
        "https://govt-quiz-app.onrender.com/api/auth/register",
        formData
      );

     

      if (!res.data.success) throw new Error(res.data.message);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/user/get-user", {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) throw new Error("Not authenticated");

      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,
      loading: false,
      error: null,
      isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      },
      setAuth: (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
      },
      setUser: (state, action) => {
        state.user = action.payload;
      },
      
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(registerUser.pending, (state,action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state,action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FETCH USER
      .addCase(fetchUser.fulfilled, (state, action) => {
       // console.log("User fetched successfully:", action.payload);
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, clearError, setAuth , setUser } = authSlice.actions;
export default authSlice.reducer;