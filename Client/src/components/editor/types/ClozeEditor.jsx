import { useEffect, useRef } from 'react';

/**
 * Expects q.cloze shape:
 * {
 *   sentenceHtml: string,                 // rich HTML with <u>…</u> for blanks
 *   textWithGaps: string,                 // preview with ____ in place of <u>…</u>
 *   answers: Array<{ index:number, value:string }>, // one per <u>…</u> (value = inner text or '')
 * }
 */
export default function ClozeEditor({ q, onChange }) {
  const editorRef = useRef(null);

  // --- Helpers ---------------------------------------------------------------

  // Turn "A ____ B __ C" into HTML with <u>____</u> for each blank
  const previewToHtml = (preview) => {
    if (!preview) return '';
    // Replace runs of 2+ underscores with <u>____</u>
    return preview.replace(/_{2,}/g, (m) => `<u>${m}</u>`);
  };

  // Extract answers (one per <u>) and build preview text (replace <u>…</u> with ____).
  const extractAnswersAndPreview = (html) => {
    const container = document.createElement('div');
    container.innerHTML = html;

    const uNodes = Array.from(container.querySelectorAll('u'));

    // Build answers in order; if the <u>…</u> contains only underscores, treat as empty value
    const answers = uNodes.map((n, i) => {
      const raw = (n.textContent || '').trim();
      const isOnlyUnderscores = /^_+$/.test(raw);
      return { index: i + 1, value: isOnlyUnderscores ? '' : raw };
    });

    // Build textWithGaps by walking the DOM; <u>…</u> -> "____", <br> -> "\n"
    const toPreview = (node) => {
      let out = '';
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          out += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.nodeName;
          if (tag === 'U') out += '____';
          else if (tag === 'BR') out += '\n';
          else out += toPreview(child);
        }
      });
      return out;
    };

    const textWithGaps = toPreview(container);
    return { answers, textWithGaps };
  };

  // --- Init ------------------------------------------------------------------
  useEffect(() => {
    if (!q.cloze) {
      onChange({
        ...q,
        cloze: { sentenceHtml: '', textWithGaps: '', answers: [] },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor DOM in sync with state (avoid caret jumps)
  useEffect(() => {
    if (!editorRef.current || !q.cloze) return;
    const el = editorRef.current;
    if (el.innerHTML !== (q.cloze.sentenceHtml || '')) {
      el.innerHTML = q.cloze.sentenceHtml || '';
    }
  }, [q.cloze?.sentenceHtml]);

  // --- Handlers --------------------------------------------------------------

  const handleEditorInput = () => {
    const html = editorRef.current?.innerHTML || '';
    const { answers, textWithGaps } = extractAnswersAndPreview(html);
    onChange({
      ...q,
      cloze: { ...q.cloze, sentenceHtml: html, textWithGaps, answers },
    });
  };

  // Allow editing via the preview textarea (users type ____ to make blanks)
  const handlePreviewChange = (e) => {
    const preview = e.target.value;
    const html = previewToHtml(preview);
    const { answers, textWithGaps } = extractAnswersAndPreview(html);
    onChange({
      ...q,
      cloze: { ...q.cloze, sentenceHtml: html, textWithGaps, answers },
    });
  };

  const execUnderline = () => {
    // Toggle underline on current selection in the editor
    document.execCommand('underline'); // deprecated, but broadly supported
    handleEditorInput();
  };

  if (!q.cloze) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Preview (underscores) — now editable and synced */}
      <div>
        <label className="text-sm text-gray-600 block mb-1">Preview (underscores)</label>
        <textarea
          className="w-full p-2 rounded border bg-gray-50 min-h-[48px]"
          value={q.cloze.textWithGaps || ''}
          onChange={handlePreviewChange}
          placeholder="A quick ____ fox jumped over a ____"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: type <code>____</code> (4+ underscores) to add a blank.
        </p>
      </div>

      {/* Rendered (HTML) shows the actual underlines */}
      {/* <div>
        <label className="text-sm text-gray-600 block mb-1">Rendered (with underline)</label>
        <div
          className="w-full p-2 rounded border bg-white"
          dangerouslySetInnerHTML={{ __html: q.cloze.sentenceHtml || '' }}
        />
      </div> */}

      {/* Sentence editor (rich) */}
      <div>
        <label className="text-sm text-gray-600 block mb-1">Sentence*</label>

        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={execUnderline}
            className="px-2 py-1 rounded border underline font-semibold"
            title="Underline to create a blank"
          >
            U
          </button>
          <span className="text-sm text-gray-500">
            Select text and click <span className="underline">U</span> to turn it into a blank.
          </span>
        </div>

        <div
          ref={editorRef}
          className="w-full min-h-[60px] p-2 rounded border focus:outline-none"
          contentEditable
          data-placeholder="Type your sentence here and underline words to turn them into blanks"
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Answers (auto) */}
      <div className="space-y-2">
        {q.cloze.answers.length === 0 ? (
          <p className="text-sm text-gray-500">Underline words or type ____ above to generate blanks.</p>
        ) : (
          q.cloze.answers.map((a) => (
            <div key={a.index} className="flex items-center gap-2">
              <span className="w-6 text-right">#{a.index}</span>
              <input
                className="flex-1 p-2 rounded border"
                value={a.value}
                onChange={(e) => {
                  const next = q.cloze.answers.map((x) =>
                    x.index === a.index ? { ...x, value: e.target.value } : x
                  );
                  onChange({ ...q, cloze: { ...q.cloze, answers: next } });
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
