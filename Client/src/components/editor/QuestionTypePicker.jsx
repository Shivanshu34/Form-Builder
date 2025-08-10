const TYPES = [
  { key: 'categorize', label: 'Categorize' },
  { key: 'cloze', label: 'Cloze' },
  { key: 'comprehension', label: 'Comprehension' }
];

export default function QuestionTypePicker({ onPick }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex gap-3">
      {TYPES.map(t => (
        <button key={t.key} onClick={() => onPick(t.key)} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
          + {t.label}
        </button>
      ))}
    </div>
  );
}