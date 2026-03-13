function ExplanationPanel({ title, items, emptyLabel, tone = "default" }) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-300/25 bg-amber-400/10"
      : "border-white/10 bg-[color:var(--card-bg)]";

  return (
    <section className={`rounded-[1.5rem] border p-5 ${toneClasses}`}>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
        {title}
      </p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--muted-text)]">
        {items?.length ? items.map((item) => <p key={item}>• {item}</p>) : <p>{emptyLabel}</p>}
      </div>
    </section>
  );
}

export default ExplanationPanel;
