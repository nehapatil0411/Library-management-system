import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiMenu, FiBookOpen, FiHome, FiSettings,
  FiLogOut, FiX, FiUsers, FiBarChart2, FiPlusCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, CreditCard } from "lucide-react";
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchMembers } from './../../slices/membersSlice';
import { fetchBooks } from '../../slices/bookSlice';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend
} from "recharts";
import Fines from '../Fines';

const Dashboard = () => {
  const { books } = useSelector((state) => state.books);
  const { members } = useSelector((state) => state.members);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalMembers: 0
  });

  // Active Tab
  const pathSegments = location.pathname.split('/');
  const activeTab = pathSegments[pathSegments.length - 1] || 'dashboard';

  // Fetch data
  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchBooks());
  }, [dispatch]);

  // ✅ Recalculate stats whenever books/members change
  useEffect(() => {
    if (books) {
      const totalBooks = books.length;
      const availableBooks = books.filter(book => book.isAvailable === true).length;
      const borrowedBooks = books.filter(book => book.isAvailable === false).length;
      const totalMembers = members.length;

      setStats({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalMembers,
      });
    }
  }, [books, members]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
    closed: { x: "-100%", transition: { type: "spring", damping: 20, stiffness: 200 } }
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
    { id: 'books', label: 'Books', icon: <FiBookOpen size={20} />, path: '/dashboard/books' },
    { id: 'members', label: 'Members', icon: <FiUsers size={20} />, path: '/dashboard/members' },
    { id: 'reports', label: 'Reports', icon: <FiBarChart2 size={20} />, path: '/dashboard/reports' },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={20} />, path: '/dashboard/settings' },
    { id: 'reservations', label: "Reservations", icon: <Bookmark className="w-5 h-5" />, path: '/dashboard/reservations' },
    { id: 'fines', label: "Fines", icon: <CreditCard className="w-5 h-5" />, path: '/dashboard/fines' },
  ];
  // inside Dashboard component

const [selectedStat, setSelectedStat] = useState(null); // "available" | "borrowed" | null

// Function to filter books based on selection
const getFilteredBooks = () => {
  if (selectedStat === "available") {
    return books.filter(book => book.isAvailable);
  }
  if (selectedStat === "borrowed") {
    return books.filter(book => !book.isAvailable);
  }
  return [];
};


  const monthlyData = [
    { month: 'Jan', books: 20, members: 10 },
    { month: 'Feb', books: 35, members: 15 },
    { month: 'Mar', books: 25, members: 18 },
    { month: 'Apr', books: 40, members: 22 },
    { month: 'May', books: 50, members: 30 },
    { month: 'Jun', books: 45, members: 28 },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        className={`bg-indigo-700 text-white shadow-lg flex flex-col fixed h-screen z-30 overflow-y-auto transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-600">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold tracking-tight flex items-center"
          >
            <span className="mr-2">📚</span>
            {isSidebarOpen && <span>BookDash Admin</span>}
          </motion.h2>
          {isSidebarOpen && (
            <button
              className="p-2 rounded-lg hover:bg-indigo-600 transition-colors"
              onClick={toggleSidebar}
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === item.id ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-indigo-600">
          <button
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer w-full"
            onClick={() => navigate('/login')}
          >
            <FiLogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed top-4 left-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg z-10 hover:bg-indigo-700 transition-colors"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiMenu size={20} />
          </motion.button>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              className="p-2 mr-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow lg:hidden"
              onClick={toggleSidebar}
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab.charAt().toUpperCase() + activeTab.slice(1)} Overview
            </h1>
          </div>

          {(activeTab === 'books' || activeTab === 'members') && (
            <Link
              to={activeTab === 'books' ? '/dashboard/add-book' : '/dashboard/manage-members'}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              <FiPlusCircle size={18} />
              <span>{activeTab === 'books' ? 'Add New Book' : 'Add New Member'}</span>
            </Link>
          )}
        </div>

        {/* Stats */}
        {/* Stats */}
{activeTab === 'dashboard' && (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        variants={statCardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition"
        onClick={() => setSelectedStat("all")}
      >
        <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Books</h3>
        <p className="text-3xl font-bold text-gray-800">{stats.totalBooks}</p>
      </motion.div>

      <motion.div
        variants={statCardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition"
        onClick={() => setSelectedStat("available")}
      >
        <h3 className="text-gray-500 text-sm font-semibold mb-2">Available Books</h3>
        <p className="text-3xl font-bold text-gray-800">{stats.availableBooks}</p>
      </motion.div>

      <motion.div
        variants={statCardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition"
        onClick={() => setSelectedStat("borrowed")}
      >
        <h3 className="text-gray-500 text-sm font-semibold mb-2">Borrowed Books</h3>
        <p className="text-3xl font-bold text-gray-800">{stats.borrowedBooks}</p>
      </motion.div>

      <motion.div
        variants={statCardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500"
      >
        <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Members</h3>
        <p className="text-3xl font-bold text-gray-800">{stats.totalMembers}</p>
      </motion.div>
    </div>

    {/* Show Filtered Books */}
    {selectedStat && (
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedStat === "available" && "Available Books"}
            {selectedStat === "borrowed" && "Borrowed Books"}
            {selectedStat === "all" && "All Books"}
          </h3>
          <button
            onClick={() => setSelectedStat(null)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredBooks().map((book) => (
            <div key={book.id} className="bg-gray-50 p-4 rounded-lg shadow">
              <h4 className="font-bold text-gray-800">{book.title}</h4>
              <p className="text-sm text-gray-500 mb-2">{book.author}</p>
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                  book.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {book.isAvailable ? "Available" : "Borrowed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

        {/* Dashboard Charts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-xl shadow-md">
          {activeTab !== 'dashboard' && activeTab !== 'reservations' && activeTab !== 'fines' && <Outlet />}

          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Charts */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-md font-semibold text-gray-700 mb-4">Books Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={[
                          { name: "Available", value: stats.availableBooks },
                          { name: "Borrowed", value: stats.borrowedBooks },
                        ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          <Cell fill="#34D399" />
                          <Cell fill="#F59E0B" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-md font-semibold text-gray-700 mb-4">Overview</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: "Books", value: stats.totalBooks },
                        { name: "Members", value: stats.totalMembers },
                        { name: "Borrowed", value: stats.borrowedBooks },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366F1" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-md font-semibold text-gray-700 mb-4">Monthly Growth</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="books" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="members" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Books */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.slice(0, 6).map((book) => (
                    <motion.div key={book.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                      <img src={book.image} alt="" style={{height:"300px", width:"100%", objectFit:"cover"}} />
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                        book.isAvailable ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {book.isAvailable ? "Available" : "Borrowed"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Members */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.slice(0, 6).map((member) => (
                    <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                      <img src={member.image} alt="" style={{height:"300px", width:"100%", objectFit:"cover", borderRadius:"8px"}} />
                      <p className="text-dark text-black-500">📧 {member.firstName} {member.lastName}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reservations */}
          {activeTab === 'reservations' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Reservations Management</h2>
              <p className="text-gray-600">This section will contain all book reservation information and management tools.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p>Reservation management features are currently under development.</p>
              </div>
            </div>
          )}

          {/* Fines */}
          {activeTab === 'fines' && (
            <Fines />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
