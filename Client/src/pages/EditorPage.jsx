import { useState } from 'react';
import api from '../api/axiosClient';
import FormHeader from '../components/editor/FormHeader';
import QuestionTypePicker from '../components/editor/QuestionTypePicker';
import QuestionCard from '../components/editor/QuestionCard';
import { v4 as uuid } from 'uuid';

export default function EditorPage() {
  const [form, setForm] = useState({
    title: 'Untitled Form',
    description: '',
    headerImageUrl: '',
    questions: [],
  });

  const [createdForm, setCreatedForm] = useState(null);

  const addQuestion = (type) => {
    const base = { id: uuid(), type, prompt: '', imageUrl: '', required: false };
    if (type === 'categorize') base.categorize = { categories: [], options: [] };
    if (type === 'cloze')
      base.cloze = {
        textWithGaps: ``,
        answers: [{ index: 1, value: '' }, { index: 2, value: '' }],
      };
    if (type === 'comprehension') base.comprehension = { passage: '', subQuestions: [] };
    setForm((f) => ({ ...f, questions: [...f.questions, base] }));
  };

  const save = async () => {
    try {
      if (!createdForm) {
        const { data } = await api.post('/api/forms', form);
        setCreatedForm(data);
        alert('Created! Share/Preview: ' + window.location.origin + '/preview/' + data.shareId);
      } else {
        const { data } = await api.put('/api/forms/' + createdForm._id, form);
        setCreatedForm(data);
        alert('Saved!');
      }
    } catch (err) {
      console.error(err);
      alert('Save failed. Check console for details.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <FormHeader form={form} setForm={setForm} createdForm={createdForm} />

      <QuestionTypePicker onPick={addQuestion} />

      <div className="space-y-4">
        {form.questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={idx}
            onChange={(updated) => {
              setForm((f) => ({
                ...f,
                questions: f.questions.map((qq) => (qq.id === q.id ? updated : qq)),
              }));
            }}
            onRemove={() =>
              setForm((f) => ({
                ...f,
                questions: f.questions.filter((qq) => qq.id !== q.id),
              }))
            }
          />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={save}>
          Save
        </button>
        {createdForm && (
          <a
            className="px-4 py-2 rounded bg-gray-800 text-white"
            href={`/preview/${createdForm.shareId}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview
          </a>
        )}
      </div>
    </div>
  );
}
