import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NicknameModal from './components/NicknameModal';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));
const Home = lazy(() => import('./pages/Homepage'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const AddExpense = lazy(() => import('./pages/AddExpense'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NicknameModal />
      <Router>
        <div className="min-h-screen pt-safe pb-safe">
          <Suspense
            fallback={
              <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size={40} color="#3B82F6" />
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                {/* Main Tab Routes with Bottom Navigation */}
                <Route element={<Layout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/restaurants" element={<Restaurants />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Sub-pages without Bottom Navigation */}
                <Route path="/trip/:tripId" element={<TripDetails />} />
                <Route path="/trip/:tripId/add-expense" element={<AddExpense />} />
                <Route path="/trip/:tripId/expense/:expenseId" element={<AddExpense />} />
                <Route path="/restaurant/:restaurantId" element={<RestaurantDetails />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
