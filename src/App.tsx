import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import WorkerList from './pages/WorkerList';
import JobBoard from './pages/JobBoard';
import LoginRegister from './pages/LoginRegister';
import CreateEditProfile from './components/profile/CreateEditProfile';
import MerchantJoin from './pages/MerchantJoin';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-905 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <Routes>
            {/* Main Layout Pages */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/workers" element={<Layout><WorkerList /></Layout>} />
            <Route path="/jobs" element={<Layout><JobBoard /></Layout>} />
            <Route path="/search" element={<Layout><JobBoard /></Layout>} />
            <Route path="/profile" element={<Layout><CreateEditProfile /></Layout>} />
            <Route path="/register" element={<Layout><MerchantJoin /></Layout>} />
            <Route path="/register-merchant" element={<Layout><MerchantJoin /></Layout>} />
            
            {/* Account Authorization Page */}
            <Route path="/auth" element={<LoginRegister />} />

            {/* Error 404 Fallback */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                    <h2 className="text-4xl font-extrabold text-blue-600 mb-2">404</h2>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      পেজটি খুঁজে পাওয়া যায়নি / Page not found
                    </p>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
