import { Link } from "react-router-dom";

function ModuleCard({ title, description, to, badge }) {
  return (
    <article className="rounded-[1.7rem] border border-white/10 bg-[color:var(--panel-bg)] p-6 shadow-aura">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-skygrid">{badge}</p>
      <h3 className="mt-3 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted-text)]">{description}</p>
      <div className="mt-5">
        <Link
          to={to}
          className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-neon/40 hover:bg-white/5"
        >
          Open module
        </Link>
      </div>
    </article>
  );
}

export default ModuleCard;
