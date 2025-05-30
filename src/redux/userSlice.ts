import { createSlice } from "@reduxjs/toolkit";

// Example slice for managing user state
const userSlice = createSlice({
  name: "user",
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    updateName: (state, action) => {
      state.user.name = action.payload;
    },
    clearUser: (state) => {
      state.user = {};
    },
  },
});

export const { setUser, clearUser, updateName } = userSlice.actions;
export default userSlice;
