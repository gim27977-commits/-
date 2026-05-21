import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (q) api.get(`/users/search?q=${encodeURIComponent(q)}`).then(r => setUsers(r.data));
  }, [q]);

  return (
    <div>
      <h2 className="font-semibold mb-4">"{q}" 검색 결과</h2>
      {users.length === 0 && <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>}
      {users.map(u => (
        <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded">
          {u.avatar
            ? <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">{u.username?.[0]?.toUpperCase()}</div>
          }
          <div>
            <p className="font-semibold text-sm">{u.username}</p>
            {u.bio && <p className="text-xs text-gray-400 truncate max-w-xs">{u.bio}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
