import React, { useState, useEffect } from 'react';
import { ActivePage } from './types/index.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages: ActivePage[] = ['home', 'secure', 'restore', 'how-to-use', 'privacy', 'terms', 'contact'];
      if (validPages.includes(hash as ActivePage)) {
        setActivePage(hash as ActivePage);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    window.location.hash = page;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors">
      <Header activePage={activePage} onNavigate={handleNavigate} />
      
      <main className="flex-1">
        {activePage === 'home' && <HomeView onNavigate={handleNavigate} />}
        {activePage === 'secure' && <SecureView />}
        {activePage === 'restore' && <RestoreView />}
        {activePage === 'how-to-use' && <HowToUseView onNavigate={handleNavigate} />}
        {activePage === 'privacy' && <PrivacyView />}
        {activePage === 'terms' && <TermsView />}
        {activePage === 'contact' && <ContactView />}
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
