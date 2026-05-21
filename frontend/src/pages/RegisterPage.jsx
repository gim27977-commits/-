import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(form.username, form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || '가입 실패'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-3">
          <h1 className="text-4xl font-bold italic text-center mb-4">Instaclone</h1>
          <p className="text-gray-400 text-sm text-center mb-6">친구들의 사진과 영상을 보려면 가입하세요.</p>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={submit} className="space-y-2">
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none focus:border-gray-400" placeholder="이메일" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none focus:border-gray-400" placeholder="사용자 이름" value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} required />
            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none focus:border-gray-400" placeholder="비밀번호" type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white rounded py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 mt-2">{loading ? '가입 중...' : '가입하기'}</button>
          </form>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-center">
          계정이 있으신가요? <Link to="/login" className="text-blue-500 font-semibold">로그인</Link>
        </div>
      </div>
    </div>
  );
}
