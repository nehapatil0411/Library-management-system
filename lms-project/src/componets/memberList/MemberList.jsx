import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMembers } from '../../slices/membersSlice';
import { Link } from 'react-router-dom';


const MemberList = () => {
  const { members, loading, error } = useSelector((state) => state.members);
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 9;

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered members based on search
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate pagination values
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Members</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => dispatch(fetchMembers())}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4 sm:mb-0">
            👥 Library Members
          </h1>

          {/* Search Bar */}
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="🔍 Search members by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to page 1 on search
              }}
              className="w-full px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              {/* Member Image */}
              <div className="w-full h-64 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.firstname}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-6xl text-indigo-500">👤</div>
                )}
              </div>

              {/* Member Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {member.firstname} {member.lastname}
                </h3>
                <p className="text-Dark-500 text-lg mb-2">
                  {member.firstName } {member.lastName }
                </p>
               

                <div className="flex justify-between items-center mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.status || "inactive"}
                  </span>
                 <span className="text-sm text-gray-500">
  📚 {member.borrowedBooks ? member.borrowedBooks.length : 0} borrowed
</span>
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/dashboard/member/${member.id}`}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all font-medium text-center"
                  >
                    View
                  </Link>

                  <Link
  to={`/dashboard/member/${member.id}/edit`}
  className="flex-1 py-2 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg text-center"
>
  Edit
</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔎</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Members Found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search or add new members to the system.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 text-sm font-medium border rounded-lg ${
                    currentPage === number
                      ? "text-white bg-indigo-600 border-indigo-600"
                      : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {number}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MemberList;
