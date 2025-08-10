import { useEffect, useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ---------- tiny UI bits ----------
function Chip({ label, dragging, setNodeRef, attributes, listeners, transform }) {
  const style = { transform: CSS.Transform.toString(transform), opacity: dragging ? 0.6 : 1 };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="px-3 py-1 rounded-full shadow-sm cursor-grab select-none
                 bg-purple-100 text-purple-800 border border-purple-200"
    >
      {label}
    </div>
  );
}
function DraggableChip({ id, label, activeId }) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({ id });
  return (
    <Chip
      label={label}
      dragging={isDragging || activeId === id}
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      transform={transform}
    />
  );
}
function BlankZone({ id, filled, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <span
      ref={setNodeRef}
      className={`inline-flex items-center min-w-[110px] min-h-[36px] px-2 py-1 rounded-lg mx-1
        ${isOver ? 'bg-blue-50 border border-blue-300' : 'bg-gray-200 border border-gray-300'}`}
      style={{ verticalAlign: 'baseline' }}
    >
      {filled ? children : <span className="w-full text-transparent">____</span>}
    </span>
  );
}

// ---------- main component ----------
export default function ClozeFill({ q, onAnswer }) {
  const text = q.cloze?.textWithGaps || '';
  const html = q.cloze?.sentenceHtml || '';

  // Parse sentence into tokens (text / blank#index)
  const tokens = useMemo(() => {
    if (/\{\{\d+\}\}/.test(text)) {
      return text.split(/(\{\{\d+\}\})/g).map(tok => {
        const m = tok.match(/\{\{(\d+)\}\}/);
        return m ? { type: 'blank', index: Number(m[1]) } : { type: 'text', text: tok };
      });
    }
    if (/_{3,}/.test(text)) {
      let n = 0;
      return text.split(/(_{3,})/g).map(tok =>
        /_{3,}/.test(tok) ? { type: 'blank', index: ++n } : { type: 'text', text: tok }
      );
    }
    if (/<u>/i.test(html)) {
      const container = document.createElement('div');
      container.innerHTML = html;
      const out = [];
      let n = 0;
      const walk = (node) => {
        node.childNodes.forEach(ch => {
          if (ch.nodeType === Node.TEXT_NODE) out.push({ type: 'text', text: ch.textContent || '' });
          else if (ch.nodeType === Node.ELEMENT_NODE && ch.nodeName === 'U') out.push({ type: 'blank', index: ++n });
          else if (ch.nodeType === Node.ELEMENT_NODE) walk(ch);
        });
      };
      walk(container);
      return out;
    }
    return [{ type: 'text', text }];
  }, [text, html]);

  // Word bank from answers
  const bankItems = useMemo(
    () => (q.cloze?.answers || []).map(a => ({ id: `ans-${a.index}`, label: a.value, answerIndex: a.index })),
    [q.cloze?.answers]
  );

  // blankIndex -> optionId ; each option can be used once
  const [assigned, setAssigned] = useState({});
  const [activeId, setActiveId] = useState(null);

  const usedIds = new Set(Object.values(assigned));
  const bankRemaining = bankItems.filter(i => !usedIds.has(i.id));

  // bubble up answers
  useEffect(() => {
    const toSend = Object.entries(assigned)
      .map(([idx, optId]) => {
        const item = bankItems.find(b => b.id === optId);
        return item ? { index: Number(idx), value: item.label } : null;
      })
      .filter(Boolean);
    onAnswer?.({ cloze: toSend });
  }, [assigned, bankItems, onAnswer]);

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const overId = over.id; // 'bank' or 'blank-#'
    const optId = active.id;

    if (overId === 'bank') {
      setAssigned(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) if (next[k] === optId) delete next[k];
        return next;
      });
      return;
    }

    const m = String(overId).match(/^blank-(\d+)$/);
    if (!m) return;
    const blankIndex = Number(m[1]);

    setAssigned(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === optId) delete next[k];
      next[blankIndex] = optId;
      return next;
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Word bank */}
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="text-sm text-gray-600 mr-2">Drag answers:</div>
        <BankDroppable>
          {bankRemaining.map(item => (
            <DraggableChip key={item.id} id={item.id} label={item.label} activeId={activeId} />
          ))}
        </BankDroppable>
      </div>

      {/* Sentence */}
      <div className="text-lg leading-8">
        {tokens.map((t, i) => {
          if (t.type === 'text') return <span key={i}>{t.text}</span>;
          const slotId = `blank-${t.index}`;
          const filledItem = assigned[t.index] ? bankItems.find(b => b.id === assigned[t.index]) : null;
          return (
            <BlankZone key={i} id={slotId} filled={!!filledItem}>
              {filledItem && <DraggableChip id={filledItem.id} label={filledItem.label} activeId={activeId} />}
            </BlankZone>
          );
        })}
      </div>

      <DragOverlay>
        {activeId ? <Chip label={bankItems.find(b => b.id === activeId)?.label || ''} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// droppable bank
function BankDroppable({ children }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'bank' });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap gap-2 rounded border px-2 py-2
        ${isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
    >
      {children}
    </div>
  );
}
