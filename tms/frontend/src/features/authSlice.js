import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "../api/api"; // Import API axios

const initialState = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
    hasRedirected: false, // Tambahkan state untuk memantau apakah sudah di-redirect
}

export const LoginUser = createAsyncThunk("user/LoginUser", async(user, thunkAPI) => {
    try {
        const response = await api.post(`/login`, {
            email: user.email,
            password: user.password
        });
        return response.data;
    } catch (error) {
        if(error.response){
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
        return thunkAPI.rejectWithValue("Terjadi kesalahan saat login");
    }
});

export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
    try {
        const response = await api.get("/me"); // Tidak perlu tulis baseURL lagi
        return response.data;
    } catch (error) {
        if (error.response) {
            return thunkAPI.rejectWithValue(error.response.data.msg);
        }
    }
});

export const LogOut = createAsyncThunk("user/LogOut", async() => {
    await api.delete(`/logout`);
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        reset: (state) => initialState,
        setRedirected: (state, action) => {
            state.hasRedirected = action.payload;  // Update status redirect
        }
    },
    extraReducers:(builder) => {
        builder.addCase(LoginUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(LoginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.user = action.payload;
        });
        builder.addCase(LoginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        // Get User Login
        builder.addCase(getMe.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getMe.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.isError = false;
            state.user = action.payload;
        });
        builder.addCase(getMe.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        });

        builder.addCase(LogOut.fulfilled, (state) => {
            return initialState; // Reset Redux state setelah logout
        });
    }
});

export const { reset, setRedirected, hasRedirected } = authSlice.actions;
export default authSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 
// import api from "../api/api"; // Import API axios

// const initialState = {
//     user: null,
//     isError: false,
//     isSuccess: false,
//     isLoading: false,
//     message: ""
// }

// export const LoginUser = createAsyncThunk("user/LoginUser", async(user, thunkAPI) => {
//     try {
//         const response = await api.post(`/login`, {
//             email: user.email,
//             password: user.password
//         });
//         return response.data;
//     } catch (error) {
//         if(error.response){
//             const message = error.response.data.msg;
//             return thunkAPI.rejectWithValue(message);
//         }
//         return thunkAPI.rejectWithValue("Terjadi kesalahan saat login"); // 🔹 Tambahkan handling jika error.response tidak ada
//     }
// });

// export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
//     try {
//         const response = await api.get("/me"); // Tidak perlu tulis baseURL lagi
//         return response.data;
//     } catch (error) {
//         if (error.response) {
//             return thunkAPI.rejectWithValue(error.response.data.msg);
//         }
//     }
// });

// export const LogOut = createAsyncThunk("user/LogOut", async() => {
//     await api.delete(`/logout`);
// });

// export const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers:{
//         reset: (state) => initialState
//     },
//     extraReducers:(builder) =>{
//         builder.addCase(LoginUser.pending, (state) =>{
//             state.isLoading = true;
//         });
//         builder.addCase(LoginUser.fulfilled, (state, action) =>{
//             state.isLoading = false;
//             state.isSuccess = true;
//             state.user = action.payload;
//         });
//         builder.addCase(LoginUser.rejected, (state, action) =>{
//             state.isLoading = false;
//             state.isError = true;
//             state.message = action.payload;
//         })

//         // Get User Login
//         builder.addCase(getMe.pending, (state) =>{
//             state.isLoading = true;
//         });
//         builder.addCase(getMe.fulfilled, (state, action) =>{
//             state.isLoading = false;
//             state.isSuccess = true;
//             state.user = action.payload;
//         });
//         builder.addCase(getMe.rejected, (state, action) =>{
//             state.isLoading = false;
//             state.isError = true;
//             state.message = action.payload;
//             state.user = null;
//         })

//         builder.addCase(LogOut.fulfilled, (state) => {
//             return initialState; // Reset Redux state setelah logout
//         });
//     }
// });

// export const {reset} = authSlice.actions;
// export default authSlice.reducer;