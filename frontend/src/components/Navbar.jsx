import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiSearch, FiPlusSquare, FiCompass, FiSettings } from 'react-icons/fi';
import { AiFillHome } from 'react-icons/ai';
import Logo from './Logo';
import Avatar from './Avatar';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const isActive = (path) => location.pathname === path;
  const iconCls = (active) => `text-2xl transition-transform hover:scale-110 ${active ? 'text-black' : 'text-gray-700'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/"><Logo className="text-2xl" /></Link>

        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xs">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-100 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </form>

        <div className="flex items-center gap-5">
          <Link to="/" title="홈">{isActive('/') ? <AiFillHome className={iconCls(true)} /> : <FiHome className={iconCls(false)} />}</Link>
          <Link to="/explore" title="탐색"><FiCompass className={iconCls(isActive('/explore'))} /></Link>
          <Link to="/upload" title="업로드"><FiPlusSquare className={iconCls(isActive('/upload'))} /></Link>
          <Link to={`/profile/${user?.username}`} title="프로필">
            <Avatar username={user?.username} avatar={user?.avatar} size={28} ring={isActive(`/profile/${user?.username}`)} />
          </Link>
          <Link to="/settings" title="설정" className="text-gray-700 hover:text-black">
            <FiSettings className={iconCls(isActive('/settings'))} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
