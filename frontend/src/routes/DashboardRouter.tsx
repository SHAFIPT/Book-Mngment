
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store/store';
import RetailDashboard from '../components/RetailDashboard';
import AuthorDashboard from '../components/AuthorDashboard';
import AdminDashboard from '../components/AdminDashboard';

const DashboardRouter = () => {
  const { role } = useSelector((state: RootState) => state.user);

  if (role === 'RETAIL') return <RetailDashboard />;
  if (role === 'AUTHOR') return <AuthorDashboard />;
  if (role === 'ADMIN') return <AdminDashboard />;
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
      <p className="text-lg font-semibold">Invalid role or user not authenticated.</p>
    </div>
  );
};

export default DashboardRouter;
