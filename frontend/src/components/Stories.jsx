import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';

export default function Stories() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users/suggestions').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-6 px-4 py-4 overflow-x-auto">
      <div className="flex gap-4 min-w-min">
        <Link to={`/profile/${user.username}`} className="flex flex-col items-center gap-1 flex-shrink-0">
          <Avatar username={user.username} avatar={user.avatar} size={64} ring />
          <span className="text-xs truncate max-w-[64px]">내 스토리</span>
        </Link>
        {users.map(u => (
          <Link key={u.id} to={`/profile/${u.username}`} className="flex flex-col items-center gap-1 flex-shrink-0">
            <Avatar username={u.username} avatar={u.avatar} size={64} ring />
            <span className="text-xs truncate max-w-[64px]">{u.username}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
