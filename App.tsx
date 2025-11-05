
import React, { useState } from 'react';
import { WardrobeProvider } from './hooks/useWardrobe';
import { DashboardIcon, WardrobeIcon, OutfitIcon, AnalyticsIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import Wardrobe from './components/Wardrobe';
import Outfits from './components/Outfits';
import Analytics from './components/Analytics';

type Tab = 'dashboard' | 'wardrobe' | 'outfits' | 'analytics';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'wardrobe':
        return <Wardrobe />;
      case 'outfits':
        return <Outfits />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  // FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  const NavItem: React.FC<{ tabName: Tab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-lg transition-colors duration-200 ${
        activeTab === tabName ? 'bg-accent text-white' : 'hover:bg-secondary text-highlight'
      }`}
    >
      {icon}
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );

  return (
    <WardrobeProvider>
      <div className="flex flex-col sm:flex-row min-h-screen bg-primary font-sans">
        <nav className="w-full sm:w-64 bg-secondary p-4 flex sm:flex-col justify-around sm:justify-start gap-4 sticky top-0 sm:h-screen z-10 border-b sm:border-b-0 sm:border-r border-accent">
          <div className="text-2xl font-bold text-white mb-0 sm:mb-8 text-center sm:text-left">
            MyWardrobe
          </div>
          <NavItem tabName="dashboard" icon={<DashboardIcon />} label="Dashboard" />
          <NavItem tabName="wardrobe" icon={<WardrobeIcon />} label="Wardrobe" />
          <NavItem tabName="outfits" icon={<OutfitIcon />} label="Outfits" />
          <NavItem tabName="analytics" icon={<AnalyticsIcon />} label="Analytics" />
        </nav>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </WardrobeProvider>
  );
};

export default App;