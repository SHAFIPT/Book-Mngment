// routes/Routes.tsx
import { Routes, Route } from 'react-router-dom';
import BookStoreApp from '../pages/Home';
import GuestGuard from '../components/guards/GuestGuard';
import AuthGuard from '../components/guards/AuthGuard';
import DashboardRouter from './DashboardRouter';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login/Register: Only for guests */}
      <Route
        path="/"
        element={
          <GuestGuard>
            <BookStoreApp />
          </GuestGuard>
        }
      />

      {/* Dashboard: Only for authenticated users */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardRouter />
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
