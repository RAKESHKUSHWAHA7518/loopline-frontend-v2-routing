import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginDialog } from './components/LoginDialog';
import { SignupDialog } from './components/SignupDialog';
import { useAuth } from './hooks/useAuth';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Agents } from './pages/Agents';
import { UpdateAgent } from './pages/UpdateAgent';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { PhoneNumbers } from './pages/PhoneNumbers';
import { CallHistory } from './pages/CallHistory';
import { Routing } from './pages/Routing';
import { Billing } from './pages/Billing';
import { FluidInfinityLoader } from './components/FluidInfinityLoader';
import './App.css';

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/home" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:agentId" element={<UpdateAgent />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/phone-numbers" element={<PhoneNumbers />} />
        <Route path="/call-history" element={<CallHistory />} />
        <Route path="/routing" element={<Routing />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };
  
 

  if (loading) {
    return <div className="min-h-screen bg-black  flex items-center justify-center">  <FluidInfinityLoader size="xl" color="#3F67DA" className=" min-h-screen"/> </div>;
  }

  return (
    <BrowserRouter>
      {user ? (
        <AuthenticatedApp />
      ) : (
        <LandingPage onOpenLogin={() => setIsLoginOpen(true)} />
      )}

      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />

      <SignupDialog
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </BrowserRouter>
  );
}

export default App;
