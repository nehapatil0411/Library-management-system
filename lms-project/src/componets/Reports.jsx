import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "../slices/bookSlice";
import { fetchMembers } from "../slices/membersSlice";
import { fetchLoans } from "../slices/loansSlice";
import { BookOpen, Users, DollarSign, TrendingUp, Clock } from "lucide-react";

const Reports = () => {
  const dispatch = useDispatch();

  const { books } = useSelector((s) => s.books);
  const { members } = useSelector((s) => s.members);
  const { loans } = useSelector((s) => s.loans);

  useEffect(() => {
    if (!books || books.length === 0) dispatch(fetchBooks());
    if (!members || members.length === 0) dispatch(fetchMembers());
    if (!loans || loans.length === 0) dispatch(fetchLoans());
  }, [dispatch]);

  // Compute stats
  const totalIssued = loans.filter((l) => !l.returnDate).length;
  const totalReturned = loans.filter((l) => l.returnDate).length;

  const totalRent = useMemo(() => {
    return loans.reduce((sum, l) => {
      const book = books.find((b) => String(b.id) === String(l.bookId));
      return sum + (book?.rent || 0);
    }, 0);
  }, [loans, books]);

  const mostPopularBook = useMemo(() => {
    const borrowCounts = {};
    loans.forEach((l) => {
      borrowCounts[l.bookId] = (borrowCounts[l.bookId] || 0) + 1;
    });
    const popularBookId = Object.entries(borrowCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
    return books.find((b) => String(b.id) === String(popularBookId));
  }, [loans, books]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">📊 Library Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <BookOpen className="text-indigo-600 w-8 h-8" />
          <div>
            <div className="text-2xl font-bold">{totalIssued}</div>
            <div className="text-gray-600 text-sm">Books Issued</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <Users className="text-green-600 w-8 h-8" />
          <div>
            <div className="text-2xl font-bold">{totalReturned}</div>
            <div className="text-gray-600 text-sm">Books Returned</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <DollarSign className="text-yellow-600 w-8 h-8" />
          <div>
            <div className="text-2xl font-bold">₹{totalRent}</div>
            <div className="text-gray-600 text-sm">Total Rent Collected</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <TrendingUp className="text-pink-600 w-8 h-8" />
          <div>
            <div className="text-lg font-bold">
              {mostPopularBook ? mostPopularBook.title : "N/A"}
            </div>
            <div className="text-gray-600 text-sm">Most Popular Book</div>
          </div>
        </div>
      </div>

      {/* Member Loan History */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Member Loan History
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Member</th>
                <th className="p-3 border-b">Book</th>
                <th className="p-3 border-b">Issued</th>
                <th className="p-3 border-b">Due</th>
                <th className="p-3 border-b">Returned</th>
                <th className="p-3 border-b">Rent</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => {
                const member = members.find(
                  (m) => String(m.id) === String(l.memberId)
                );
                const book = books.find(
                  (b) => String(b.id) === String(l.bookId)
                );
                return (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">
                      {member
                        ? `${member.firstName ?? ""} ${
                            member.lastName ?? member.name ?? ""
                          }`
                        : `Member #${l.memberId}`}
                    </td>
                    <td className="p-3 border-b">{book?.title ?? "—"}</td>
                    <td className="p-3 border-b">{l.startDate}</td>
                    <td className="p-3 border-b">{l.dueDate}</td>
                    <td className="p-3 border-b">
                      {l.returnDate || <span className="text-red-500">Not returned</span>}
                    </td>
                    <td className="p-3 border-b">₹{book?.rent ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
