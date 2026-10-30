import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative overflow-hidden bg-slate-50/70">
        {/* Soft Ambient Background Watermark Logo */}
        <div
          aria-hidden="true"
          className="fixed inset-y-0 right-0 left-0 lg:left-64 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
        >
          <img
            src="/admk logo.png"
            alt=""
            className="w-[280px] sm:w-[420px] lg:w-[520px] max-h-[75vh] object-contain opacity-[0.400] transition-opacity duration-300"
          />
        </div>

        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
