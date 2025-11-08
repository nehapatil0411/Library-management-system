import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLoans } from "../slices/loansSlice";
import { fetchMembers } from "../slices/membersSlice";
import { fetchBooks } from "../slices/bookSlice";
import { setFines } from "../slices/fineSlice"; // To update fines
import { DollarSign } from "lucide-react";

const FineReport = () => {
  const dispatch = useDispatch();
  const { loans } = useSelector((s) => s.loans);
  const { members } = useSelector((s) => s.members);
  const { books } = useSelector((s) => s.books);
  const { fines } = useSelector((s) => s.fines);

  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    if (!loans?.length) dispatch(fetchLoans());
    if (!members?.length) dispatch(fetchMembers());
    if (!books?.length) dispatch(fetchBooks());
  }, [dispatch]);

  const calculateLoanFine = (loan) => {
    const today = new Date();
    const due = new Date(loan.dueDate);
    let fine = 0;

    if (!loan.returnDate) {
      const diffDays = Math.floor((today - due) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) fine += diffDays * 20;
    } else {
      const returned = new Date(loan.returnDate);
      const diffDays = Math.floor((returned - due) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) fine += diffDays * 20;
    }

    if (loan.isDamaged) fine += 50;
    return fine;
  };

  // Merge fines (automatic + manual) for each member
  const memberFines = members.map((m) => {
    const memberLoans = loans.filter((l) => String(l.memberId) === String(m.id));
    const autoFines = memberLoans.map((loan) => ({
      id: `loan-${loan.id}`,
      bookId: loan.bookId,
      reason: loan.isDamaged ? "Damage" : !loan.returnDate ? "Overdue" : `Late return`,
      amount: calculateLoanFine(loan),
      date: loan.returnDate || new Date().toISOString(),
    }));

    const manualFines = fines.filter((f) => String(f.memberId) === String(m.id));

    const allFines = [...autoFines, ...manualFines];
    const totalFine = allFines.reduce((sum, f) => sum + f.amount, 0);

    return { ...m, fines: allFines, totalFine };
  });

  const handleCollectFine = (memberId) => {
    const memberFines = fines.filter((f) => String(f.memberId) === String(memberId));
    const collectedAmount = memberFines.reduce((sum, f) => sum + f.amount, 0);

    // Remove fines from state (set to 0)
    const remainingFines = fines.filter((f) => String(f.memberId) !== String(memberId));
    dispatch(setFines(remainingFines));

    setTotalCollected((prev) => prev + collectedAmount);
    alert(`Collected ₹${collectedAmount} from member.`);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <DollarSign className="text-indigo-600" /> Fine Report
      </h2>

      <div className="text-right font-semibold text-lg">
        Total Fine Collected: ₹{totalCollected}
      </div>

      {memberFines.map((mf) => (
        <div key={mf.id} className="bg-white shadow rounded-xl p-6 space-y-4 border">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {mf.firstName} {mf.lastName || mf.name}
            </h3>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mf.totalFine > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                Total Fine: ₹{mf.totalFine}
              </span>
              {mf.totalFine > 0 && (
                <button
                  onClick={() => handleCollectFine(mf.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Collect Fine
                </button>
              )}
            </div>
          </div>

          {mf.fines.length === 0 ? (
            <p className="text-gray-500 text-sm">No fines yet.</p>
          ) : (
            <table className="w-full text-sm border mt-2">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-2 border">Book</th>
                  <th className="p-2 border">ISBN</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {mf.fines.map((f, idx) => {
                  const book = books.find((b) => String(b.id) === String(f.bookId));
                  return (
                    <tr key={idx} className="text-center">
                      <td className="p-2 border">{book?.title || `Book #${f.bookId}`}</td>
                      <td className="p-2 border text-indigo-600">{book?.isbn.join(" , ") || "N/A"}</td>
                      <td className="p-2 border">{f.reason}</td>
                      <td className="p-2 border font-medium text-red-600">₹{f.amount}</td>
                      <td className="p-2 border">{new Date(f.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default FineReport;
