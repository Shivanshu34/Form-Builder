import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategory({ id, children, onRemove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 rounded bg-gray-100">
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-grab select-none px-2"
        aria-label="Drag"
      >
        ≡
      </button>
      <div className="flex-1">{children}</div>
      <button type="button" className="px-2 text-red-500" onClick={onRemove}>✕</button>
    </div>
  );
}

export default function CategorizeEditor({ q, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const addCategory = () =>
    onChange({
      ...q,
      categorize: {
        ...q.categorize,
        categories: [...q.categorize.categories, { id: crypto.randomUUID(), label: 'Category' }],
      },
    });

  const addOption = () =>
    onChange({
      ...q,
      categorize: {
        ...q.categorize,
        options: [
          ...q.categorize.options,
          { id: crypto.randomUUID(), label: 'Item', imageUrl: '', correctCategoryId: '' },
        ],
      },
    });

  const setCategory = (id, patch) =>
    onChange({
      ...q,
      categorize: {
        ...q.categorize,
        categories: q.categorize.categories.map(c => (c.id === id ? { ...c, ...patch } : c)),
      },
    });

  const removeCategory = (id) => {
    const categories = q.categorize.categories.filter(c => c.id !== id);
    // Clear the belongs-to value for options that pointed to the removed category
    const options = q.categorize.options.map(o =>
      o.correctCategoryId === id ? { ...o, correctCategoryId: '' } : o
    );
    onChange({ ...q, categorize: { ...q.categorize, categories, options } });
  };

  const setOption = (id, patch) =>
    onChange({
      ...q,
      categorize: {
        ...q.categorize,
        options: q.categorize.options.map(o => (o.id === id ? { ...o, ...patch } : o)),
      },
    });

  const removeOption = (id) =>
    onChange({
      ...q,
      categorize: {
        ...q.categorize,
        options: q.categorize.options.filter(o => o.id !== id),
      },
    });

  const onCatDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = q.categorize.categories.map(c => c.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const categories = arrayMove(q.categorize.categories, oldIndex, newIndex);
    onChange({ ...q, categorize: { ...q.categorize, categories } });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Categories</h4>
          <button className="text-sm" onClick={addCategory}>+ Add</button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onCatDragEnd}>
          <SortableContext
            items={q.categorize.categories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {q.categorize.categories.map(c => (
                <SortableCategory key={c.id} id={c.id} onRemove={() => removeCategory(c.id)}>
                  <input
                    className="w-full"
                    value={c.label}
                    onChange={(e) => setCategory(c.id, { label: e.target.value })}
                    onPointerDown={(e) => e.stopPropagation()} // avoid drag when focusing
                  />
                </SortableCategory>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Items with "Belongs To" */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Item</h4>
          <button className="text-sm" onClick={addOption}>+ Add</button>
        </div>

        <div className="space-y-3">
          {q.categorize.options.map(o => (
            <div key={o.id} className="grid grid-cols-1 md:grid-cols-[1fr,220px,auto] gap-3 items-start">
              <input
                className="w-full"
                value={o.label}
                onChange={(e) => setOption(o.id, { label: e.target.value })}
              />

              <select
                className="w-full"
                value={o.correctCategoryId}
                onChange={(e) => setOption(o.id, { correctCategoryId: e.target.value })}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <option value="">Belongs to…</option>
                {q.categorize.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <button type="button" className="px-2 text-red-500" onClick={() => removeOption(o.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
