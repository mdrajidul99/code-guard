import React, { useState, useEffect, useRef } from 'react';
import { ActivePage } from './types/index.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { PageBackBar } from './components/PageBackBar.tsx';
import { HomeView } from './views/HomeView.tsx';
import { SecureView } from './views/SecureView.tsx';
import { RestoreView } from './views/RestoreView.tsx';
import { HowToUseView } from './views/HowToUseView.tsx';
import { PrivacyView } from './views/PrivacyView.tsx';
import { TermsView } from './views/TermsView.tsx';
import { ContactView } from './views/ContactView.tsx';

function AppContent() {
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      const validPages: ActivePage[] = ['home', 'secure', 'restore', 'how-to-use', 'privacy', 'terms', 'contact'];
      if (validPages.includes(hash as ActivePage)) {
        return hash as ActivePage;
      }
    } catch {
      // Fallback
    }
    return 'home';
  });

  const [historyStack, setHistoryStack] = useState<ActivePage[]>([]);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }
      const hash = window.location.hash.replace('#', '');
      const validPages: ActivePage[] = ['home', 'secure', 'restore', 'how-to-use', 'privacy', 'terms', 'contact'];
      if (validPages.includes(hash as ActivePage)) {
        setActivePage(hash as ActivePage);
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: ActivePage) => {
    if (page === activePage) return;
    setHistoryStack((prev) => [...prev, activePage]);
    setActivePage(page);
    isNavigatingRef.current = true;
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 0) {
      const prevPage = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, prev.length - 1));
      setActivePage(prevPage);
      isNavigatingRef.current = true;
      window.location.hash = prevPage;
    } else {
      setActivePage('home');
      isNavigatingRef.current = true;
      window.location.hash = 'home';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors">
      <Header activePage={activePage} onNavigate={handleNavigate} onBack={handleBack} />
      
      {/* Top Back & Breadcrumb Bar on all inner pages */}
      <PageBackBar currentPage={activePage} onBack={handleBack} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {activePage === 'home' && <HomeView onNavigate={handleNavigate} />}
        {activePage === 'secure' && <SecureView onBack={handleBack} onNavigate={handleNavigate} />}
        {activePage === 'restore' && <RestoreView onBack={handleBack} onNavigate={handleNavigate} />}
        {activePage === 'how-to-use' && <HowToUseView onNavigate={handleNavigate} onBack={handleBack} />}
        {activePage === 'privacy' && <PrivacyView onBack={handleBack} onNavigate={handleNavigate} />}
        {activePage === 'terms' && <TermsView onBack={handleBack} onNavigate={handleNavigate} />}
        {activePage === 'contact' && <ContactView onBack={handleBack} onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
