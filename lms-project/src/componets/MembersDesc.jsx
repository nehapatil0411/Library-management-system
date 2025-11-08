// src/components/MemberDescription.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiClock, FiTrash2 } from "react-icons/fi";
import { deleteMember } from "../slices/membersSlice";
import { fetchLoans, borrowBook, returnBook } from "../slices/loansSlice";
import { fetchBooks } from "../slices/bookSlice";
import { fetchMembers } from "../slices/membersSlice";
import { addFine, setFines } from "../slices/fineSlice";

const MemberDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { members } = useSelector((s) => s.members);
  const { books } = useSelector((s) => s.books);
  const { loans } = useSelector((s) => s.loans);
  const { fines } = useSelector((s) => s.fines);

  const member = members.find((m) => String(m.id) === String(id));

  const [showLendPanel, setShowLendPanel] = useState(false);
  const [selectedBookToLend, setSelectedBookToLend] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const [collectedTotal, setCollectedTotal] = useState(0);

  useEffect(() => {
    if (!books?.length) dispatch(fetchBooks());
    if (!members?.length) dispatch(fetchMembers());
    dispatch(fetchLoans());
  }, [dispatch]);

  const activeLoans = useMemo(
    () => (loans || []).filter((l) => String(l.memberId) === String(id) && !l.returnDate),
    [loans, id]
  );

  const borrowedDetails = activeLoans.map((loan) => {
    const book = books.find((b) => String(b.id) === String(loan.bookId));
    return { loan, book };
  });

  const returnedHistory = (loans || [])
    .filter((l) => String(l.memberId) === String(id) && l.returnDate)
    .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
    .slice(0, 6)
    .map((loan) => {
      const book = books.find((b) => String(b.id) === String(loan.bookId));
      return { loan, book };
    });

  // Show both unpaid and paid fines
  const memberFines = fines
    .filter((f) => String(f.memberId) === String(id))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const unpaidFines = memberFines.filter(f => !f.collected);
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  const handleDelete = async () => {
    if (!member) return;
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    await dispatch(deleteMember(member.id));
    navigate("/dashboard/members");
  };

  const handleConfirmLend = async () => {
    if (!selectedBookToLend) {
      alert("Choose a book to lend.");
      return;
    }
    const startDate = new Date().toISOString().slice(0, 10);
    try {
      await dispatch(
        borrowBook({
          bookId: selectedBookToLend,
          memberId: member.id,
          startDate,
          dueDate,
        })
      ).unwrap();
      setShowLendPanel(false);
      setSelectedBookToLend("");
      dispatch(fetchLoans());
    } catch (err) {
      alert("Failed to lend: " + (err?.message || err));
    }
  };

  const handleReturn = async (loanId, bookId) => {
    if (!window.confirm("Confirm return of this book?")) return;

    const loan = loans.find((l) => String(l.id) === String(loanId));
    const today = new Date();
    const due = new Date(loan.dueDate);
    const lateDays = today > due ? Math.ceil((today - due) / (1000 * 60 * 60 * 24)) : 0;

    try {
      await dispatch(returnBook({ loanId, bookId })).unwrap();

      if (lateDays > 0) {
        await dispatch(
          addFine({
            memberId: member.id,
            bookId,
            reason: `Late return (${lateDays} days)`,
            amount: lateDays * 20,
            date: new Date().toISOString(),
            collected: false
          })
        );
      }

      dispatch(fetchLoans());
    } catch (err) {
      alert("Failed to return: " + (err?.message || err));
    }
  };

  const handleAddFine = async (bookId, reason, amount) => {
    if (!bookId || !reason || !amount) return;
    try {
      await dispatch(
        addFine({
          memberId: id,
          bookId,
          reason,
          amount: Number(amount),
          date: new Date().toISOString(),
          collected: false
        })
      );
      alert("Fine added successfully!");
    } catch (err) {
      alert("Failed to add fine: " + (err?.message || err));
    }
  };

  const handleCollectFines = () => {
    const updatedFines = fines.map(f => {
      if (String(f.memberId) === String(id) && !f.collected) {
        return { ...f, collected: true };
      }
      return f;
    });
    dispatch(setFines(updatedFines));

    const collected = fines
      .filter(f => String(f.memberId) === String(id) && !f.collected)
      .reduce((sum, f) => sum + f.amount, 0);

    setCollectedTotal(prev => prev + collected);
    alert(`Collected ₹${collected} from member.`);
  };

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Member not found</h2>
          <button
            onClick={() => navigate("/dashboard/members")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard/members")}
                className="mr-4 p-2 rounded-full hover:bg-indigo-500 transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold">Member Details</h1>
            </div>
            <div className="flex space-x-3">
              <Link to={`/dashboard/edit-member/${member.id}`} className="p-2 rounded-full hover:bg-indigo-500 transition-colors">
                <FiEdit size={20} />
              </Link>
              <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500 transition-colors">
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Member info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {member.image ? <img src={member.image} alt={member.firstName} className="w-32 h-32 rounded-full object-cover" /> : <span className="text-5xl text-indigo-600">👤</span>}
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{member.firstName} {member.lastName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center"><FiMail className="w-5 h-5 text-gray-500 mr-3" /><span className="text-gray-700">{member.email}</span></div>
                  <div className="flex items-center"><FiPhone className="w-5 h-5 text-gray-500 mr-3" /><span className="text-gray-700">{member.phone}</span></div>
                  <div className="flex items-center"><FiMapPin className="w-5 h-5 text-gray-500 mr-3" /><span className="text-gray-700">{member.address}</span></div>
                  <div className="flex items-center"><FiCalendar className="w-5 h-5 text-gray-500 mr-3" /><span className="text-gray-700">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "N/A"}</span></div>
                </div>
                <div className="mt-6"><p className="text-sm text-gray-600">Member since: {new Date(member.joinDate).toLocaleDateString()}</p></div>
              </div>
            </div>

            {/* Borrowed books */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Borrowed Books ({borrowedDetails.length})</h3>
              {borrowedDetails.length === 0 ? (
                <p className="text-gray-500">This member hasn't borrowed any books.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {borrowedDetails.map(({ loan, book }) => (
                    <div key={loan.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-md mr-3"><FiBook className="w-5 h-5 text-indigo-600" /></div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-800">{book ? book.title : `Book #${loan.bookId}`}</h4>
                        <p className="text-sm text-gray-600">by {book?.author}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <FiClock className="mr-1" />
                          <span>Due: <b>{loan.dueDate}</b></span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <Link to={`/dashboard/books/${loan.bookId}`} className="text-indigo-600 hover:text-indigo-800 text-sm">View</Link>
                        <button onClick={() => handleReturn(loan.id, loan.bookId)} className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Return</button>
                        <button onClick={() => handleAddFine(loan.bookId, "Damage", 50)} className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Fine for Damage</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fine history */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Fine History</h3>
                {totalUnpaid > 0 && (
                  <button onClick={handleCollectFines} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Collect Fine (₹{totalUnpaid})
                  </button>
                )}
              </div>
              {memberFines.length === 0 ? (
                <p className="text-gray-500">No fines yet.</p>
              ) : (
                <div className="space-y-2">
                  {memberFines.map((f, idx) => {
                    const book = books.find((b) => String(b.id) === String(f.bookId));
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded ${f.collected ? 'bg-gray-100' : 'bg-yellow-50'}`}>
                        <div>
                          <div className="font-medium text-gray-800">{book ? book.title : `Book #${f.bookId}`}</div>
                          <div className="text-sm text-gray-500">{f.reason} | {new Date(f.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`font-semibold text-gray-700 ${f.collected ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{f.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDescription;
