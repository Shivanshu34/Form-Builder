export default function ComprehensionEditor({ q, onChange }) {
  const set = (patch) =>
    onChange({ ...q, comprehension: { ...q.comprehension, ...patch } });

  const addMCQ = () =>
    set({
      subQuestions: [
        ...q.comprehension.subQuestions,
        { id: crypto.randomUUID(), kind: 'mcq', question: 'New MCQ', options: ['A','B','C','D'], correct: [] }
      ],
    });

  const addShort = () =>
    set({
      subQuestions: [
        ...q.comprehension.subQuestions,
        { id: crypto.randomUUID(), kind: 'short', question: 'Short answer', answerText: '' }
      ],
    });

  const setSub = (id, patch) =>
    set({
      subQuestions: q.comprehension.subQuestions.map((sq) =>
        sq.id === id ? { ...sq, ...patch } : sq
      ),
    });

  // NEW: delete + duplicate
  const removeSub = (id) =>
    set({
      subQuestions: q.comprehension.subQuestions.filter((sq) => sq.id !== id),
    });

  const duplicateSub = (id) => {
    const list = q.comprehension.subQuestions;
    const idx = list.findIndex((sq) => sq.id === id);
    if (idx === -1) return;
    const clone = { ...list[idx], id: crypto.randomUUID() };
    const subQuestions = [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)];
    set({ subQuestions });
  };

  return (
    <div className="mt-3 space-y-3">
      <textarea
        className="w-full p-2 rounded border"
        rows={5}
        placeholder="Passage..."
        value={q.comprehension.passage}
        onChange={(e) => set({ passage: e.target.value })}
      />

      <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-gray-100" onClick={addMCQ} type="button">+ MCQ</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={addShort} type="button">+ Short Answer</button>
      </div>

      <div className="space-y-3">
        {q.comprehension.subQuestions.map((sq) => (
          <div key={sq.id} className="p-3 border rounded">
            <div className="flex justify-between items-center gap-2">
              <input
                className="flex-1"
                value={sq.question}
                onChange={(e) => setSub(sq.id, { question: e.target.value })}
              />

              {/* kind pill + actions (copy / delete) */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 uppercase">
                  {sq.kind}
                </span>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-100"
                  title="Duplicate"
                  onClick={() => duplicateSub(sq.id)}
                >
                  ⎘
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-red-50 text-red-600"
                  title="Delete"
                  onClick={() => {
                    if (confirm('Delete this sub-question?')) removeSub(sq.id);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>

            {sq.kind === 'mcq' && (
              <div className="mt-2 space-y-1">
                {sq.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="flex-1"
                      value={opt}
                      onChange={(e) =>
                        setSub(sq.id, {
                          options: sq.options.map((o, j) => (j === i ? e.target.value : o)),
                        })
                      }
                    />
                    <label className="text-sm">
                      Correct{' '}
                      <input
                        type="checkbox"
                        checked={sq.correct.includes(i)}
                        onChange={() =>
                          setSub(sq.id, {
                            correct: sq.correct.includes(i)
                              ? sq.correct.filter((x) => x !== i)
                              : [...sq.correct, i],
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {sq.kind === 'short' && (
              <input
                className="mt-2 w-full"
                placeholder="Expected answer (optional)"
                value={sq.answerText || ''}
                onChange={(e) => setSub(sq.id, { answerText: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
