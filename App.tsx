
import React, { useState } from 'react';
import Login from './components/Login';
import ModuleSelection from './components/ModuleSelection';
import DashboardLayout from './components/DashboardLayout';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [activeModule, setActiveModule] = useState<string>('');

  const handleLoginSuccess = () => {
    setCurrentView(AppView.MODULE_SELECTION);
  };

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentView(AppView.LOGIN);
  };

  const handleSwitchModule = () => {
    setCurrentView(AppView.MODULE_SELECTION);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === AppView.LOGIN && <Login onLoginSuccess={handleLoginSuccess} />}
      {currentView === AppView.MODULE_SELECTION && (
        <ModuleSelection onSelect={handleModuleSelect} />
      )}
      {currentView === AppView.DASHBOARD && (
        <DashboardLayout 
          onLogout={handleLogout} 
          onSwitchModule={handleSwitchModule} 
          moduleType={activeModule}
        />
      )}
    </div>
  );
};

export default App;
