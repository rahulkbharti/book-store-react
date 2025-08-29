import { createSlice } from "@reduxjs/toolkit";

export type LoginData = {
  access_token: string;
  refresh_token: string;
  email: string;
  exp: string;
};

export type stateData = {
  login_data: LoginData;
  isAuthenticated: boolean;
};

const initialState: stateData = {
  login_data: {
    access_token: "",
    refresh_token: "",
    email: "",
    exp: "",
  },
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.login_data = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.login_data = {
        access_token: "",
        refresh_token: "",
        email: "",
        exp: "",
      };
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
