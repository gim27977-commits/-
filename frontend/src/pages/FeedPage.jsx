import { useEffect, useState } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/feed').then(r => setPosts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/></div>;

  if (!posts.length) return (
    <div>
      <Stories />
      <div className="text-center py-20 text-gray-400 bg-white border border-gray-200 rounded-xl">
        <p className="text-4xl mb-3">📸</p>
        <p className="text-lg mb-2 text-gray-700">아직 게시물이 없어요</p>
        <p className="text-sm">사람들을 팔로우하거나 첫 사진을 올려보세요</p>
      </div>
    </div>
  );

  return (
    <div>
      <Stories />
      {posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
    </div>
  );
}
