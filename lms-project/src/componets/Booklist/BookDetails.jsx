import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchBooks } from "../../slices/bookSlice";
import { fetchMembers } from "../../slices/membersSlice";
import { fetchLoans, borrowBook, returnBook } from "../../slices/loansSlice";
import {
  ArrowLeft,
  BookOpen,
  Tag,
  Calendar,
  Languages,
  FileText,
  DollarSign,
} from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { books, status: booksStatus, error: booksError } = useSelector((s) => s.books);
  const { members } = useSelector((s) => s.members);
  const { loans, status: loansStatus } = useSelector((s) => s.loans);

  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dueDate, setDueDate] = useState(
    () => new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );

  // Fetch data
  useEffect(() => {
    if (!books?.length) dispatch(fetchBooks());
    if (!members?.length) dispatch(fetchMembers());
    if (!loans?.length) dispatch(fetchLoans());
  }, [dispatch]);

  const book = books?.find((b) => String(b.id) === String(id));
  if (!book) return <div className="p-6">Book not found.</div>;

  const {
    title,
    author,
    image,
    description,
    category,
    isbn = [],
    publishedYear,
    publicationYear,
    pages,
    language,
    rent,
  } = book;

  const year = publishedYear || publicationYear || "—";

  // === Copies logic ===
  const totalCopies = Array.isArray(isbn) ? isbn.length : 1;

  // All loans for this book (match by id or isbn)
  const bookLoans = loans.filter((l) => String(l.bookId) === String(book.id));

  // Active (not returned yet)
  const activeLoans = bookLoans.filter((l) => !l.returnDate);

  const borrowedCopies = activeLoans.length;
  const availableCopies = Math.max(0, totalCopies - borrowedCopies);

  // === Borrow handler ===
  const handleBorrow = async () => {
    if (!selectedMemberId) {
      alert("Please select a member.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    // find which ISBNs are already borrowed
    const borrowedIsbns = activeLoans.map((l) => l.bookIsbn);

    // pick a free ISBN
    const freeIsbn = isbn.find((code) => !borrowedIsbns.includes(code));

    if (!freeIsbn) {
      alert("No copies available.");
      return;
    }

    try {
      await dispatch(
        borrowBook({
          bookId: book.id,
          bookIsbn: freeIsbn,
          memberId: selectedMemberId,
          startDate: today,
          dueDate,
        })
      ).unwrap();
      setShowBorrowForm(false);
      dispatch(fetchLoans());
    } catch (e) {
      alert(`Borrow failed: ${e}`);
    }
  };

  // === Return handler ===
  const handleReturn = async (loanId) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await dispatch(
        returnBook({
          loanId,
          bookId: book.id,
          returnDate: today,
        })
      ).unwrap();
      dispatch(fetchLoans());
    } catch (e) {
      alert(`Return failed: ${e}`);
    }
  };

  if (booksStatus === "loading" || loansStatus === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full" />
      </div>
    );
  }

  if (booksError) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl">
        Failed to load book. {booksError}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">by {author || "Unknown"}</p>
        </div>
        <Link
          to="/dashboard/books"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
        >
          <ArrowLeft size={18} /> Back to Books
        </Link>
      </div>

      {/* Main Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[3/4] bg-gray-100">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <BookOpen className="w-14 h-14" />
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  availableCopies > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {availableCopies} / {totalCopies} Available
              </span>
              {category && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  <Tag size={14} /> {category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} /> Description
            </h2>
            <p className="text-gray-700">{description || "No description available."}</p>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase text-gray-500">ISBNs</div>
                <div className="mt-1 font-medium text-gray-900 break-all">
                  {isbn.join(", ")}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase flex items-center gap-2 text-gray-500">
                  <Calendar size={16} /> Published
                </div>
                <div className="mt-1 font-medium text-gray-900">{year}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase flex items-center gap-2 text-gray-500">
                  <BookOpen size={16} /> Pages
                </div>
                <div className="mt-1 font-medium text-gray-900">{pages || "—"}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase flex items-center gap-2 text-gray-500">
                  <Languages size={16} /> Language
                </div>
                <div className="mt-1 font-medium text-gray-900">{language || "—"}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs uppercase flex items-center gap-2 text-gray-500">
                  <DollarSign size={16} /> Rent
                </div>
                <div className="mt-1 font-medium text-gray-900">
                  {rent ? `₹${rent}` : "—"}
                </div>
              </div>
            </div>

            {/* CTA Area */}
            <div className="mt-8 flex flex-wrap gap-3">
              {availableCopies > 0 && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-white shadow bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowBorrowForm((v) => !v)}
                >
                  Borrow
                </button>
              )}
            </div>

            {/* Borrow Form */}
            {showBorrowForm && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Member</label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName ?? ""} {m.lastName ?? ""} {m.name && `(${m.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Due date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleBorrow}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Confirm Borrow
                  </button>
                  <button
                    onClick={() => setShowBorrowForm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    
      {/* Borrowed Copies */}
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrowed Copies</h3>
  {activeLoans.length === 0 ? (
    <p className="text-gray-500">No copies borrowed.</p>
  ) : (
    <ul className="space-y-3">
      {activeLoans.map((loan) => {
        const member = members.find((m) => String(m.id) === String(loan.memberId));
        return (
          <li
            key={loan.id}
            className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {member?.firstName} {member?.lastName || member?.name}  
              </p>
              <p className="text-sm text-gray-700">
                Borrowed ISBN: <span className="text-indigo-600 font-medium">{loan.isbn}</span>
              </p>
              <p className="text-xs text-gray-500">
                From <span className="font-medium">{loan.startDate}</span> →{" "}
                <span className="font-medium">{loan.dueDate}</span>
              </p>
            </div>
            {!loan.returnDate && (
              <button
                onClick={() => handleReturn(loan.id)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Return
              </button>
            )}
          </li>
        );
      })}
    </ul>
  )}
</div>

    </div>
  );
};

export default BookDetails;
