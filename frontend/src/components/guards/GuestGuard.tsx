import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../redux/store/store';

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default GuestGuard;