import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosClient';
import CategorizeFill from '../components/fill/CategorizeFill';
import ClozeFill from '../components/fill/ClozeFill';
import ComprehensionFill from '../components/fill/ComprehensionFill';

export default function PreviewPage() {
  const { shareId } = useParams();
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get('/api/forms/public/' + shareId).then(({ data }) => setForm(data)); 
  }, [shareId]);

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {form.headerImageUrl && <img src={form.headerImageUrl} className="rounded" />}
      <h1 className="text-2xl font-bold">{form.title}</h1>
      <p className="text-gray-600">{form.description}</p>

      <div className="space-y-6">
        {form.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded shadow">
            <div className="mb-2 text-gray-600">Q{idx + 1} · {q.type}</div>
            <div className="font-medium mb-2">{q.prompt}</div>
            {q.imageUrl && <img src={q.imageUrl} className="mb-3 rounded" />}
            {q.type === 'categorize' && <CategorizeFill q={q} onAnswer={() => {}} />}
            {q.type === 'cloze' && <ClozeFill q={q} onAnswer={() => {}} />}
            {q.type === 'comprehension' && <ComprehensionFill q={q} onAnswer={() => {}} />}
          </div>
        ))}
      </div>
    </div>
  );
}