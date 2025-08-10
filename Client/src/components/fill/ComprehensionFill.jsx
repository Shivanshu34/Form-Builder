export default function ComprehensionFill({ q, onAnswer }) {
  const setAns = (subId, value, kind) => onAnswer({ comprehension: [{ subId, kind, value }] });

  return (
    <div className="space-y-3">
      <div className="p-3 rounded bg-gray-50 whitespace-pre-wrap">{q.comprehension.passage}</div>
      {q.comprehension.subQuestions.map(sq => (
        <div key={sq.id} className="p-3 border rounded">
          <div className="font-medium mb-2">{sq.question}</div>
          {sq.kind === 'mcq' && (
            <div className="space-y-1">
              {sq.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="checkbox" onChange={e => setAns(sq.id, (e.target.checked ? i : null), 'mcq')} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {sq.kind === 'short' && (
            <input className="w-full border rounded px-2 py-1" onChange={e => setAns(sq.id, e.target.value, 'short')} />
          )}
        </div>
      ))}
    </div>
  );
}