import { useEffect, useState, type ReactNode } from "react";
import { getRoleLabel } from "../core";
import type {
  AppRoute,
  OverviewCard,
  PageMeta,
  RouteDefinition,
  User,
} from "../types";
import type { ThemeMode } from "../useTheme";
import { ThemeToggle } from "./ThemeToggle";
import { SummaryCard } from "./ui";

type AppShellProps = {
  currentUser: User;
  route: AppRoute;
  allowedRoutes: RouteDefinition[];
  pageMeta: PageMeta;
  overviewCards: OverviewCard[];
  flash: ReactNode;
  children: ReactNode;
  themeMode: ThemeMode;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  onSetTheme: (mode: ThemeMode) => void;
};

export function AppShell({
  currentUser,
  route,
  allowedRoutes,
  pageMeta,
  overviewCards,
  flash,
  children,
  themeMode,
  onNavigate,
  onLogout,
  onSetTheme,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="shell">
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`sidebar panel elevated ${isSidebarOpen ? "is-open" : ""}`}
      >
        <div className="sidebar-mobile-header">
          <div className="brand-block">
            <div className="brand-badge">Icon</div>
            <div>
              <strong>Smart Dorm</strong>
              <span>Management System</span>
            </div>
          </div>
          <button
            className="hamburger-close-btn"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="profile-card">
          <div className="avatar">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h2>{currentUser.fullName}</h2>
            <p>{getRoleLabel(currentUser.role)}</p>
            <small>{currentUser.username}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {allowedRoutes.map((item) => (
            <button
              key={item.key}
              className={`nav-button ${route === item.key ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                onNavigate(item.key);
                setIsSidebarOpen(false);
              }}
            >
              <span>{item.emoji}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle mode={themeMode} onSetMode={onSetTheme} />
          <button
            className="ghost-button full-width"
            type="button"
            onClick={onLogout}
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="page-header panel">
          <div className="header-mobile-wrapper">
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(true)}
              title="Menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div>
              <div className="eyebrow subtle">
                {getRoleLabel(currentUser.role)}
              </div>
              <h1>{pageMeta.title}</h1>
              <p>{pageMeta.description}</p>
            </div>
          </div>
        </header>

        {flash}
        {route === "dashboard" ? (
          <section className="overview-grid">
            {overviewCards.map((card) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                description={card.description}
              />
            ))}
          </section>
        ) : null}
        {children}
      </main>
    </div>
  );
}
