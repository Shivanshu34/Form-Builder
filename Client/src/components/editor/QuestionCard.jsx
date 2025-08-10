// components/editor/QuestionCard.jsx
import api from '../../api/axiosClient';
import CategorizeEditor from './types/CategorizeEditor';
import ClozeEditor from './types/ClozeEditor';
import ComprehensionEditor from './types/ComprehensionEditor';

export default function QuestionCard({ q, index, onChange, onRemove }) {
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append('file', file);

      // uses your Axios client (baseURL -> http://localhost:4000)
      const { data } = await api.post('/api/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); 
      onChange({ ...q, imageUrl: data.secure_url || data.url });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Upload failed';
      console.error('Image upload error:', err);
      alert(msg);
    } finally {
      // optional: clear the input so the same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-500">Q{index + 1} · {q.type}</div>
        <div className="flex items-center gap-3">
          <label className="text-sm cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            Add Image
          </label>
          <button className="text-red-600" onClick={onRemove}>Delete</button>
        </div>
      </div>

      <input
        className="w-full text-lg outline-none"
        placeholder="Description(optional)..."
        value={q.prompt}
        onChange={e => onChange({ ...q, prompt: e.target.value })}
      />

      {q.imageUrl && <img src={q.imageUrl} alt="q" className="mt-3 rounded" />}

      {q.type === 'categorize' && <CategorizeEditor q={q} onChange={onChange} />}
      {q.type === 'cloze' && <ClozeEditor q={q} onChange={onChange} />}
      {q.type === 'comprehension' && <ComprehensionEditor q={q} onChange={onChange} />}

      <div className="mt-3">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={q.required}
            onChange={e => onChange({ ...q, required: e.target.checked })}
          />
          Required
        </label>
      </div>
    </div>
  );
}
