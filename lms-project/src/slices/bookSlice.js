import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


//Api Called By Request

const base_api = "http://localhost:3000/books";

//Here We Will fetxh Books dsata form api

export const fetchBooks = createAsyncThunk("books/fetchBooks", async () => {
  const response = await axios.get(base_api);
  return response.data;
});
// Here We Will Delete Books By Api
export const deleteBook = createAsyncThunk("books/deleteBook", async (bookId) => {
  await axios.delete(`${base_api}/${bookId}`);
  return bookId;
});

// Here We Will Add Books By Api
export const addBook = createAsyncThunk("books/addBook", async (newBook) => {
  const response = await axios.post(base_api, newBook, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data; // return added book
});
// 
export const borrowBook = createAsyncThunk(
  "books/borrowBook",
  async ({ bookId, memberId, borrowDate, dueDate }) => {
    const current = (await axios.get(`${base_api}/${bookId}`)).data;

    const hasCopies = Number.isFinite(current?.totalCopies);
    const prevAvailable = Number.isFinite(current?.availableCopies)
      ? current.availableCopies
      : (hasCopies ? current.totalCopies : 0);

    const nextAvailable = hasCopies ? Math.max(0, prevAvailable - 1) : 0;

    const updated = {
      ...current,
      isAvailable: hasCopies ? nextAvailable > 0 : false,
      ...(hasCopies && { availableCopies: nextAvailable }),
      currentLoan: {
        memberId,
        borrowDate, // ISO string "YYYY-MM-DD"
        dueDate,
      },
      history: [
        ...(current.history || []),
        {
          id: Date.now(),
          action: "borrow",
          memberId,
          borrowDate,
          dueDate,
        },
      ],
    };

    const res = await axios.put(`${base_api}/${bookId}`, updated);
    return res.data;
  }
);

export const returnBook = createAsyncThunk(
  "books/returnBook",
  async ({ bookId, memberId, returnDate }) => {
    const current = (await axios.get(`${base_api}/${bookId}`)).data;

    const hasCopies = Number.isFinite(current?.totalCopies);
    const prevAvailable = Number.isFinite(current?.availableCopies)
      ? current.availableCopies
      : (hasCopies ? 0 : 0);

    const maxCopies = Number.isFinite(current?.totalCopies) ? current.totalCopies : null;
    const nextAvailable = hasCopies
      ? Math.min(maxCopies, prevAvailable + 1)
      : 1;

    const updated = {
      ...current,
      isAvailable: hasCopies ? nextAvailable > 0 : true,
      ...(hasCopies && { availableCopies: nextAvailable }),
      currentLoan: null,
      history: [
        ...(current.history || []),
        {
          id: Date.now(),
          action: "return",
          memberId,
          returnDate,
        },
      ],
    };

    const res = await axios.put(`${base_api}/${bookId}`, updated);
    return res.data;
  }
);

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    
///Get Request/////
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

      /////Add Request/////
      builder
      .addCase(addBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books.push(action.payload); // add new book to list
      })
      .addCase(addBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

    ///Delete Request/////
    builder
      .addCase(deleteBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
       // Borrow
    builder
      .addCase(borrowBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.books.findIndex((b) => String(b.id) === String(action.payload.id));
        if (idx > -1) state.books[idx] = action.payload;
      })
      .addCase(borrowBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });

    // Return
    builder
      .addCase(returnBook.pending, (state) => {
        state.status = "loading";
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.status = "succeeded";
        const idx = state.books.findIndex((b) => String(b.id) === String(action.payload.id));
        if (idx > -1) state.books[idx] = action.payload;
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  
  },
});







export default bookSlice.reducer;
