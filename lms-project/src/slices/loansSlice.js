// src/slices/loansSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBooks } from "./bookSlice";
import { fetchMembers } from "./membersSlice";
import axios from "axios";

const BASE = "http://localhost:3000";

// Fetch all loans
export const fetchLoans = createAsyncThunk("loans/fetchLoans", async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE}/loans`);
    if (!res.ok) throw new Error("Failed to fetch loans");
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});


export const borrowBook = createAsyncThunk(
  "loans/borrowBook",
  async ({ bookId, memberId, startDate, dueDate }, thunkAPI) => {
    try {
      // 1) create loan
      const loanRes = await fetch(`${BASE}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, memberId, startDate, dueDate, returnDate: null }),
      });
      if (!loanRes.ok) throw new Error("Failed to create loan");
      const loanData = await loanRes.json();

      // 2) mark book unavailable
      await fetch(`${BASE}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: false }),
      });

      // 3) update member.borrowedBooks
      const memRes = await fetch(`${BASE}/members/${memberId}`);
      if (!memRes.ok) throw new Error("Failed to fetch member");
      const memData = await memRes.json();
      const updatedBorrowed = Array.isArray(memData.borrowedBooks)
        ? Array.from(new Set([...memData.borrowedBooks, bookId]))
        : [bookId];

      await fetch(`${BASE}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowedBooks: updatedBorrowed }),
      });

      // refresh other slices so UI updates
      thunkAPI.dispatch(fetchBooks());
      thunkAPI.dispatch(fetchMembers());
      thunkAPI.dispatch(fetchLoans());

      return loanData;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/**
 * returnBook:
 * - PATCH /loans/:id  (set returnDate)
 * - PATCH /books/:id  (set isAvailable: true)
 * - PATCH /members/:id (remove bookId from borrowedBooks)
 * - dispatch fetchBooks/fetchMembers/fetchLoans
 */
export const returnBook = createAsyncThunk(
  "loans/returnBook",
  async ({ loanId, bookId }, thunkAPI) => {
    try {
      // fetch loan to know the memberId (in case caller didn't pass it)
      const loanFetch = await fetch(`${BASE}/loans/${loanId}`);
      if (!loanFetch.ok) throw new Error("Loan not found");
      const loan = await loanFetch.json();
      if (!loan) throw new Error("Loan not found");

      const returnDate = new Date().toISOString().slice(0, 10);

      // 1) update loan
      const loanRes = await fetch(`${BASE}/loans/${loanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnDate }),
      });
      if (!loanRes.ok) throw new Error("Failed to update loan (return)");
      const updatedLoan = await loanRes.json();

      // 2) mark book available
      await fetch(`${BASE}/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: true }),
      });

      // 3) remove bookId from member.borrowedBooks
      const memberId = loan.memberId;
      const memFetch = await fetch(`${BASE}/members/${memberId}`);
      if (!memFetch.ok) throw new Error("Failed to fetch member");
      const mem = await memFetch.json();
      const newBorrowed = Array.isArray(mem.borrowedBooks)
        ? mem.borrowedBooks.filter((bId) => String(bId) !== String(bookId))
        : [];

      await fetch(`${BASE}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ borrowedBooks: newBorrowed }),
      });

      // refresh slices
      thunkAPI.dispatch(fetchBooks());
      thunkAPI.dispatch(fetchMembers());
      thunkAPI.dispatch(fetchLoans());

      return updatedLoan;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
export const addFine = createAsyncThunk(
  "loans/addFine",
  async ({ loanId, memberId, bookId, reason, amount }, { rejectWithValue }) => {
    try {
      const res = await axios.post("http://localhost:3000/fines", {
        loanId,
        memberId,
        bookId,
        reason,
        amount,
        date: new Date().toISOString().slice(0, 10),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


const loansSlice = createSlice({
  name: "loans",
  initialState: {
    loans: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(borrowBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        // push new loan to local loans array so UI sees it immediately
        state.loans.push(action.payload);
      })
      .addCase(borrowBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      .addCase(returnBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        // replace loan with updated one (contains returnDate)
        const idx = state.loans.findIndex((l) => String(l.id) === String(action.payload.id));
        if (idx !== -1) state.loans[idx] = action.payload;
        else state.loans.push(action.payload);
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
       .addCase(addFine.fulfilled, (state, action) => {
        state.fines.push(action.payload);
      }); 
  },
});

export default loansSlice.reducer;
