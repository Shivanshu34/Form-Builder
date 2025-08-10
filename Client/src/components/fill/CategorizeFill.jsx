import { useEffect, useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function Chip({ label, dragging, attributes, listeners, setNodeRef, transform }) {
  const style = { transform: CSS.Transform.toString(transform), opacity: dragging ? 0.6 : 1 };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="inline-block px-3 py-1 rounded-full shadow-sm cursor-grab select-none
                 bg-purple-100 text-purple-800 border border-purple-200"
    >
      {label}
    </div>
  );
}
function DraggableChip({ option, activeId }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: option.id });
  return (
    <Chip
      label={option.label}
      dragging={isDragging || activeId === option.id}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      transform={transform}
    />
  );
}

function DropZone({ id, title, children, color = 'gray' }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 min-h-[120px] transition
        ${isOver ? 'ring-2 ring-blue-300' : ''}
        ${color === 'rose' ? 'bg-rose-50 border border-rose-200' :
           color === 'amber' ? 'bg-amber-50 border border-amber-200' :
           color === 'sky' ? 'bg-sky-50 border border-sky-200' :
           'bg-gray-50 border border-gray-200'}`}
    >
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function CategorizeFill({ q, onAnswer }) {
  // optionId -> categoryId | 'bank' | undefined
  const [assign, setAssign] = useState({});
  const [activeId, setActiveId] = useState(null);

  const categories = q.categorize.categories;
  const options = q.categorize.options;
  const bankId = 'bank';

  const placed = useMemo(() => {
    const map = { [bankId]: [] };
    categories.forEach(c => (map[c.id] = []));
    options.forEach(o => {
      const dest = assign[o.id] || bankId;
      (map[dest] ||= []).push(o);
    });
    return map;
  }, [assign, options, categories]);

  useEffect(() => {
    const payload = Object.entries(assign)
      .filter(([, cat]) => cat && cat !== bankId)
      .map(([optionId, categoryId]) => ({ optionId, categoryId }));
    onAnswer?.({ categorize: payload });
  }, [assign, onAnswer]);

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const optionId = active.id;
    const containerId = over.id;
    if (containerId === bankId || categories.some(c => c.id === containerId)) {
      setAssign(prev => ({ ...prev, [optionId]: containerId === bankId ? undefined : containerId }));
    }
  };

  const palette = ['rose', 'amber', 'sky'];

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Bank */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Drag answers into a category:</div>
        <DropZone id={bankId}>
          {placed[bankId]?.map(o => <DraggableChip key={o.id} option={o} activeId={activeId} />)}
        </DropZone>
      </div>

      {/* Categories */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((c, i) => (
          <DropZone key={c.id} id={c.id} title={c.label} color={palette[i % palette.length]}>
            {placed[c.id]?.map(o => <DraggableChip key={o.id} option={o} activeId={activeId} />)}
          </DropZone>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <Chip label={options.find(o => o.id === activeId)?.label || ''} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
