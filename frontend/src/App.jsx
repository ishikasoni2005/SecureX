import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import { useTheme } from "./hooks/useTheme";
import CallAnalyzer from "./pages/CallAnalyzer";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Detect from "./pages/Detect";
import MessageScanner from "./pages/MessageScanner";
import WebsiteScanner from "./pages/WebsiteScanner";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-hidden bg-[color:var(--app-bg)] text-[color:var(--app-text)] transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(84,240,198,0.24),_transparent_60%)] blur-3xl" />
          <div className="absolute right-[-8rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(74,172,255,0.22),_transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 bg-cyber-grid bg-[length:48px_48px] opacity-40" />
        </div>

        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/message-scan" element={<MessageScanner />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/call-scan" element={<CallAnalyzer />} />
            <Route path="/website-scan" element={<WebsiteScanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
