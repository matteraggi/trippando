import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Homepage';
import TripDetails from './pages/TripDetails';
import AddExpense from './pages/AddExpense';
import NicknameModal from './components/NicknameModal';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NicknameModal />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/home" element={<Home />} />
            <Route path="/trip/:tripId" element={<TripDetails />} />
            <Route path="/trip/:tripId/add-expense" element={<AddExpense />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>

  );
};

export default App;
