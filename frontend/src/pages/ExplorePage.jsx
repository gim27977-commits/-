import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { resolveMediaUrl } from '../api';

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/explore').then(r => setPosts(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/></div>;

  return (
    <div>
      <h2 className="text-base font-semibold mb-4">탐색</h2>
      <div className="grid grid-cols-3 gap-1">
        {posts.map(p => (
          <Link key={p.id} to={`/post/${p.id}`}>
            <img src={resolveMediaUrl(p.image_url)} alt="" className="w-full aspect-square object-cover hover:opacity-90 transition-opacity" />
          </Link>
        ))}
      </div>
      {!posts.length && <p className="text-center text-gray-400 py-20">게시물이 없습니다</p>}
    </div>
  );
}
