import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', caption);
    try {
      await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || '업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-center mb-6 border-b border-gray-100 pb-4">새 게시물</h2>
        <form onSubmit={submit}>
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="text-center">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-sm text-gray-500">사진을 끌어다 놓거나</p>
                <p className="text-sm text-blue-500 font-semibold mt-1">컴퓨터에서 선택</p>
              </div>
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
          ) : (
            <div className="relative mb-4">
              <img src={preview} alt="" className="w-full rounded-lg object-contain max-h-80" />
              <button type="button" onClick={() => { setFile(null); setPreview(''); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 text-xs">✕</button>
            </div>
          )}
          {preview && (
            <div className="mt-4">
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="문구 입력..." className="w-full border-0 outline-none resize-none text-sm" rows={3} maxLength={2200} />
              <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white rounded py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 mt-4">{loading ? '업로드 중...' : '공유하기'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
