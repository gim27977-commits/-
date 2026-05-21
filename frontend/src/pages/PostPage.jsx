import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/posts/${id}`).then(r => setPost(r.data)).catch(() => navigate('/'));
    api.get(`/posts/${id}/comments`).then(r => setComments(r.data));
  }, [id]);

  const toggleLike = async () => {
    const { data } = await api.post(`/posts/${id}/like`);
    setPost(prev => ({ ...prev, liked: data.liked, likeCount: data.liked ? prev.likeCount + 1 : prev.likeCount - 1 }));
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/posts/${id}/comments`, { content: comment });
    setComments(prev => [...prev, data]);
    setComment('');
  };

  const handleDelete = async () => {
    await api.delete(`/posts/${id}`);
    navigate('/');
  };

  if (!post) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex max-h-[80vh]">
      <img src={post.image_url} alt="" className="w-1/2 object-cover" />
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2">
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{post.author?.username?.[0]?.toUpperCase()}</div>
            }
            <span className="font-semibold text-sm">{post.author?.username}</span>
          </Link>
          {user?.id === post.user_id && <button onClick={handleDelete} className="text-sm text-red-500">삭제</button>}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {post.caption && (
            <p className="text-sm"><span className="font-semibold mr-1">{post.author?.username}</span>{post.caption}</p>
          )}
          {comments.map(c => (
            <p key={c.id} className="text-sm"><span className="font-semibold mr-1">{c.username}</span>{c.content}</p>
          ))}
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <button onClick={toggleLike} className="text-2xl mb-1">{post.liked ? '❤️' : '🤍'}</button>
          <p className="text-sm font-semibold">좋아요 {post.likeCount}개</p>
        </div>

        <form onSubmit={submitComment} className="flex items-center border-t border-gray-100 px-4 py-2 gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="댓글 달기..." className="flex-1 text-sm outline-none" />
          <button type="submit" disabled={!comment.trim()} className="text-sm font-semibold text-blue-500 disabled:text-blue-200">게시</button>
        </form>
      </div>
    </div>
  );
}
