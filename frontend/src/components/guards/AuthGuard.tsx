
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../../redux/store/store';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default AuthGuard;
