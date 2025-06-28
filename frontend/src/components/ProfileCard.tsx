import type { FC } from 'react';
import { User, Shield, BookOpen } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  email: string;
  role: 'AUTHOR' | 'ADMIN' | 'RETAIL';
  avatarUrl?: string;
}

const roleStyles = {
  AUTHOR: {
    color: 'bg-blue-100 text-blue-600',
    icon: <BookOpen className="w-5 h-5" />
  },
  ADMIN: {
    color: 'bg-red-100 text-red-600',
    icon: <Shield className="w-5 h-5" />
  },
  RETAIL: {
    color: 'bg-green-100 text-green-600',
    icon: <User className="w-5 h-5" />
  }
};

const roleAvatars = {
    AUTHOR: 'https://ui-avatars.com/api/?name=Author&background=0D8ABC&color=fff&bold=true',
    ADMIN: 'https://ui-avatars.com/api/?name=Admin&background=FF5C5C&color=fff&bold=true',
    RETAIL: 'https://ui-avatars.com/api/?name=Retail&background=34D399&color=fff&bold=true'
  };    

const ProfileCard: FC<ProfileCardProps> = ({ name, email, role, avatarUrl }) => {
  const { color, icon } = roleStyles[role];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full max-w-xl mx-auto">
      <img
        src={avatarUrl || roleAvatars[role] || '/default-avatar.png'}
        alt="User Avatar"
        className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
      />

      <div className="flex-1">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${color}`}>
            {icon}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 mt-1">{email}</p>

      </div>
    </div>
  );
};

export default ProfileCard;
