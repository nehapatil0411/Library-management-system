// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './componets/dashboard/Dashboard';
import BookList from './componets/Booklist/BookList';
import BookDetails from "./componets/Booklist/BookDetails";
import MemberList from './componets/memberList/MemberList';
import Reports from './componets/Reports';
import Settings from './componets/Settings';
import Transaction from './componets/Transaction';
import AddBook from './componets/AddBook';
import Members from './componets/Members';
import Home from './screens/Home';
import Reservation from './componets/Reservation';
import Fines from './componets/Fines';
import MemberDescription from './componets/MembersDesc';
import Login from './componets/Login';
import EditMember from './componets/memberList/EditMember';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
          <Route path="/dashboard/member/:id/edit" element={<EditMember />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardDefaultContent />} />
            <Route path="books" element={<BookList />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="members" element={<MemberList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="transactions" element={<Transaction />} />
            <Route path="add-book" element={<AddBook />} />
              <Route path="manage-members" element={<Members />} />
            <Route path="reservations" element={<Reservation />} />
            <Route path="fines" element={<Fines />} />
            <Route path="/dashboard/member/:id" element={<MemberDescription />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

// Default content for dashboard (shown when no sub-route is selected)
function DashboardDefaultContent() {
  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
      <p>Select a section from the sidebar to get started.</p>
    </div>
  );
}

export default App;