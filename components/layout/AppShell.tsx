import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <TopNav />
      <main className="main-content">
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
