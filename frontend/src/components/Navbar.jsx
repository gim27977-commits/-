import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold italic tracking-tight">Instaclone</Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-1.5 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          />
        </form>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-gray-500">홈</Link>
          <Link to="/explore" className="hover:text-gray-500">탐색</Link>
          <Link to="/upload" className="hover:text-gray-500">게시</Link>
          <Link to={`/profile/${user?.username}`} className="hover:text-gray-500">
            {user?.avatar
              ? <img src={resolveMediaUrl(user.avatar)} alt="" className="w-7 h-7 rounded-full object-cover" />
              : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</div>
            }
          </Link>
          <button onClick={handleLogout} className="hover:text-gray-500">로그아웃</button>
        </div>
      </div>
    </nav>
  );
}
