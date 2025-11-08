import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch members
export const fetchMembers = createAsyncThunk("members/fetchMembers", async () => {
  const response = await fetch("http://localhost:3000/members");
  if (!response.ok) throw new Error("Failed to fetch members");
  return await response.json();
});

// Add member
export const addMember = createAsyncThunk("members/addMember", async (newMember) => {
  const response = await fetch("http://localhost:3000/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newMember),
  });
  if (!response.ok) throw new Error("Failed to add member");
  return await response.json();
});

// ✅ Update member
export const updateMember = createAsyncThunk(
  "members/updateMember",
  async ({ id, ...data }) => {
    const response = await fetch(`http://localhost:3000/members/${id}`, {
      method: "PUT", // or PATCH if your API supports partial updates
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update member");
    return await response.json();
  }
);

// ✅ Delete member
export const deleteMember = createAsyncThunk(
  "members/deleteMember",
  async (id) => {
    const response = await fetch(`http://localhost:3000/members/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete member");
    return id; // return the deleted member's id so we can remove it from state
  }
);

// ✅ Lend book to member (update borrowedBooks array)
export const lendBookToMember = createAsyncThunk(
  "members/lendBookToMember",
  async ({ memberId, bookId }, { getState, dispatch }) => {
    const { members } = getState().members;
    const member = members.find((m) => String(m.id) === String(memberId));
    if (!member) throw new Error("Member not found");

    const updatedBorrowedBooks = member.borrowedBooks
      ? [...new Set([...member.borrowedBooks, bookId])]
      : [bookId];

    // Update member
    const memberRes = await fetch(`http://localhost:3000/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ borrowedBooks: updatedBorrowedBooks }),
    });
    if (!memberRes.ok) throw new Error("Failed to lend book");
    const updatedMember = await memberRes.json();

    // ✅ Update book availability
    await fetch(`http://localhost:3000/books/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: false }),
    });

    // ✅ Refresh books
    dispatch(fetchBooks());

    return updatedMember;
  }
);



const membersSlice = createSlice({
  name: "members",
  initialState: {
    members: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Add
      .addCase(addMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(addMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update
      .addCase(updateMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(
          (m) => String(m.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ Delete
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(
          (m) => String(m.id) !== String(action.payload)
        );
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // ✅ Lend Book
      
      .addCase(lendBookToMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (m) => String(m.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      });
  },
});

export default membersSlice.reducer;
