
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logoutUser } from '../services/authService';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser(); // call logout API
    } catch (error) {
      console.error("Logout API failed:", error);
    }
    
    // clear Redux + navigate regardless of API success
    dispatch(logout());
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition duration-200 shadow"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;
