import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteBook } from "../../slices/bookSlice";
import { Link } from "react-router-dom";

const BookList = () => {
  const { books, status, error } = useSelector((state) => state.books);
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("title"); // title, author, genre, category

  // Apply search & filter
  const filteredBooks = books.filter((book) => {
    if (!searchQuery) return true;
    const value = book[filterBy] ? book[filterBy].toString().toLowerCase() : "";
    return value.includes(searchQuery.toLowerCase());
  });

  // Calculate pagination values
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center tracking-tight">
          📚 Available Books
        </h1>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-between items-center">
          <input
            type="text"
            placeholder={`Search by ${filterBy}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="genre">Category</option>
          </select>
        </div>

        {/* Books Grid */}
        {currentBooks.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No books found.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {currentBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group transform hover:-translate-y-2 flex flex-col"
              >
                {/* Wrap main card in Link */}
                <Link to={`/dashboard/books/${book.id}`} className="flex-grow">
                  {/* Book Image */}
                  <div className="w-full h-56 overflow-hidden">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Book Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">by {book.author}</p>

                    {/* Genre/Category badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.genre && (
                        <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                          {book.genre}
                        </span>
                      )}
                      {book.category && (
                        <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700">
                          {book.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Remove Button (outside link, always visible) */}
                <div className="px-5 pb-5">
                  <button
                    className="w-full py-2 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm hover:shadow-lg"
                    onClick={() => dispatch(deleteBook(book.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    currentPage === number
                      ? "text-white bg-indigo-600 shadow-md"
                      : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
