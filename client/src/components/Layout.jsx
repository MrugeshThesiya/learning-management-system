import React from 'react';
import { AppNavbar } from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-slate-950 flex flex-col">
      <AppNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      <Footer minimal />
    </div>
  );
}
