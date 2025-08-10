import api from '../../api/axiosClient';

export default function FormHeader({ form, setForm, createdForm }) {
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/api/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setForm(f => ({ ...f, headerImageUrl: data.url }));
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow space-y-3">
      <input className="w-full text-2xl font-semibold outline-none" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <textarea className="w-full resize-none outline-none" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={upload} />
        {form.headerImageUrl && <img src={form.headerImageUrl} alt="header" className="h-16 rounded" />}
        {createdForm && (
  <span className="text-sm text-gray-500">
    Fill link:{' '}
    <a
      href={`/fill/${createdForm.shareId}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline break-all"
    >
      {window.location.origin + '/fill/' + createdForm.shareId}
    </a>
  </span>
)}
      </div>
    </div>
  );
}