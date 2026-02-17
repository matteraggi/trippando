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
const AddRestaurantVisit = lazy(() => import('./pages/AddRestaurantVisit'));
import Layout from './components/Layout';

import InstallPWA from './components/InstallPWA';
import ReloadPrompt from './components/ReloadPrompt';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NicknameModal />
      <ReloadPrompt />
      <InstallPWA />
      <Router>
        {/* Main App Container - Fixed to viewport, respects Safe Areas */}
        <div className="fixed inset-0 w-full h-[100dvh] bg-gray-50 flex flex-col pt-[env(safe-area-inset-top)]">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center bg-gray-50">
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
                  <Route path="/restaurants/:restaurantId" element={<RestaurantDetails />} />
                  <Route path="/restaurants/:restaurantId/add-visit" element={<AddRestaurantVisit />} />
                  <Route path="/" element={<Navigate to="/home" replace />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
