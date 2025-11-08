// src/slices/finesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fines: JSON.parse(localStorage.getItem("fines")) || [], // persistent in localStorage
};

const finesSlice = createSlice({
  name: "fines",
  initialState,
  reducers: {
    addFine: (state, action) => {
      state.fines.push(action.payload);
      localStorage.setItem("fines", JSON.stringify(state.fines));
    },
    updateFine: (state, action) => {
      const index = state.fines.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.fines[index] = action.payload;
        localStorage.setItem("fines", JSON.stringify(state.fines));
      }
    },
    removeFine: (state, action) => {
      state.fines = state.fines.filter(f => f.id !== action.payload);
      localStorage.setItem("fines", JSON.stringify(state.fines));
    },
    setFines: (state, action) => {
      state.fines = action.payload;
      localStorage.setItem("fines", JSON.stringify(state.fines));
    },
  },
});

export const { addFine, updateFine, removeFine, setFines } = finesSlice.actions;
export default finesSlice.reducer;
