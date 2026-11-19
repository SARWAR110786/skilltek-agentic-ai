export const DEFAULT_SUGGESTIONS = [
  "What courses do you offer?",
  "Tell me about Agentic AI.",
  "How can I apply for admission?",
  "What is the CIT course?",
  "Where is SkillTek located?",
  "What services do you provide?",
];

export default function SaruSuggestedQuestions({
  items,
  onPick,
  disabled,
}: {
  items: string[];
  onPick: (q: string) => void;
  disabled?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Suggested questions">
      {items.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          dir={/[؀-ۿ]/.test(q) ? "rtl" : "ltr"}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-left text-[12.5px] text-ink/85 transition-colors hover:border-violet/50 hover:bg-violet/15 hover:text-white disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
