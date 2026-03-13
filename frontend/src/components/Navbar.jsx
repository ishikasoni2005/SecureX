import { Link, NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Home", to: "/" },
  { label: "Messages", to: "/message-scan" },
  { label: "Calls", to: "/call-scan" },
  { label: "Websites", to: "/website-scan" },
  { label: "Dashboard", to: "/dashboard" }
];

function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[color:var(--nav-bg)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-aura transition-transform duration-300 group-hover:scale-105">
            <span className="font-display text-lg font-bold tracking-[0.25em] text-neon">SX</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-wide">SecureX</p>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              Real-time fraud intelligence
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-white text-ink"
                      : "text-[color:var(--muted-text)] hover:bg-white/10 hover:text-[color:var(--app-text)]"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[color:var(--app-text)] transition hover:border-neon/50 hover:bg-white/10"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
