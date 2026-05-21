import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { resolveMediaUrl } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${username}`).then(r => {
      setProfile(r.data);
      setBio(r.data.bio || '');
      setAvatar(r.data.avatar || '');
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [username]);

  const toggleFollow = async () => {
    const { data } = await api.post(`/users/${username}/follow`);
    setProfile(prev => ({
      ...prev,
      isFollowing: data.following,
      followerCount: data.following ? prev.followerCount + 1 : prev.followerCount - 1,
    }));
  };

  const saveProfile = async () => {
    const { data } = await api.put('/auth/profile', { bio, avatar });
    setProfile(prev => ({ ...prev, bio: data.bio, avatar: data.avatar }));
    updateUser(data);
    setEditing(false);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/></div>;
  if (!profile) return null;

  const isMe = me?.username === username;

  return (
    <div>
      <div className="flex items-start gap-12 mb-10 pb-6 border-b border-gray-200">
        <div className="flex-shrink-0">
          {profile.avatar
            ? <img src={resolveMediaUrl(profile.avatar)} alt="" className="w-24 h-24 rounded-full object-cover" />
            : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">{profile.username?.[0]?.toUpperCase()}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-light">{profile.username}</h2>
            {isMe ? (
              <button onClick={() => setEditing(!editing)} className="border border-gray-300 rounded px-4 py-1 text-sm font-semibold hover:bg-gray-50">프로필 편집</button>
            ) : (
              <button onClick={toggleFollow} className={`px-6 py-1 rounded text-sm font-semibold ${profile.isFollowing ? 'border border-gray-300 hover:bg-gray-50' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                {profile.isFollowing ? '팔로잉' : '팔로우'}
              </button>
            )}
          </div>
          <div className="flex gap-8 mb-4 text-sm">
            <span><strong>{profile.posts?.length}</strong> 게시물</span>
            <span><strong>{profile.followerCount}</strong> 팔로워</span>
            <span><strong>{profile.followingCount}</strong> 팔로우</span>
          </div>
          {editing ? (
            <div className="space-y-2">
              <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="아바타 URL" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="소개" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none" rows={2} />
              <div className="flex gap-2">
                <button onClick={saveProfile} className="bg-blue-500 text-white px-4 py-1 rounded text-sm font-semibold">저장</button>
                <button onClick={() => setEditing(false)} className="border border-gray-300 px-4 py-1 rounded text-sm">취소</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-line">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {profile.posts?.map(p => (
          <Link key={p.id} to={`/post/${p.id}`}>
            <img src={resolveMediaUrl(p.image_url)} alt="" className="w-full aspect-square object-cover hover:opacity-90 transition-opacity" />
          </Link>
        ))}
      </div>
      {!profile.posts?.length && <p className="text-center text-gray-400 py-20">게시물이 없습니다</p>}
    </div>
  );
}
