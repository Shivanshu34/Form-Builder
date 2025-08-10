import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosClient';
import CategorizeFill from '../components/fill/CategorizeFill';
import ClozeFill from '../components/fill/ClozeFill';
import ComprehensionFill from '../components/fill/ComprehensionFill';

export default function FillPage() {
  const { shareId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({}); // { [qid]: {cloze|categorize|comprehension} }

  useEffect(() => {
    api.get('/api/forms/public/' + shareId).then(({ data }) => setForm(data));
  }, [shareId]);

  const onAnswer = (qid, patch) =>
    setAnswers(a => ({ ...a, [qid]: { ...(a[qid] || {}), ...patch } }));

  const resetQ = (qid) =>
    setAnswers(a => { const n = { ...a }; delete n[qid]; return n; });

  const isAnswered = (q) => {
    const v = answers[q.id];
    if (!v) return false;
    if (q.type === 'cloze') {
      const got = v.cloze?.filter(x => String(x.value || '').trim()).length || 0;
      return got > 0; // or compare to q.cloze.answers.length for stricter completion
    }
    if (q.type === 'categorize') return (v.categorize?.length || 0) > 0;
    if (q.type === 'comprehension') return (v.comprehension?.length || 0) > 0;
    return false;
  };

  const totals = useMemo(() => {
    if (!form) return { total: 0, answered: 0, pct: 0 };
    const total = form.questions.length;
    const answered = form.questions.filter(isAnswered).length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    return { total, answered, pct };
  }, [form, answers]);

  const submit = async () => {
    const payload = Object.entries(answers).map(([questionId, v]) => ({ questionId, ...v }));
    await api.post('/api/responses', { formId: form._id, answers: payload });
    alert('Submitted!');
  };

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {form.headerImageUrl && <img src={form.headerImageUrl} className="rounded" />}
      <h1 className="text-2xl font-bold">{form.title}</h1>
      <p className="text-gray-600">{form.description}</p>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Answered {totals.answered} / {totals.total}</span>
          <span>{totals.pct}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${totals.pct}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {form.questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="text-sm text-gray-500">Question {idx + 1} · {q.type}</div>
              <div className="flex items-center gap-2">
                {isAnswered(q) ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Answered</span>
                                : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Unanswered</span>}
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => resetQ(q.id)}
                  title="Reset this question"
                >↺ Reset</button>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="font-medium my-2">{q.prompt}</div>
              {q.imageUrl && <img src={q.imageUrl} className="mb-3 rounded" />}
              {q.type === 'categorize' && <CategorizeFill q={q} onAnswer={(v) => onAnswer(q.id, v)} />}
              {q.type === 'cloze' && <ClozeFill q={q} onAnswer={(v) => onAnswer(q.id, v)} />}
              {q.type === 'comprehension' && <ComprehensionFill q={q} onAnswer={(v) => onAnswer(q.id, v)} />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}
