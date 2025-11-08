import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "../slices/bookSlice";
import memberReduces from "../slices/membersSlice";
import loansReducer from "../slices/loansSlice";
import finesReducer from "../slices/fineSlice";



export const store = configureStore({
  reducer: {
    books: bookReducer,
    members: memberReduces,
    loans: loansReducer,
     fines: finesReducer,
  },
});
