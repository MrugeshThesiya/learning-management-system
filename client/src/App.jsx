import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-4 p-4 border-b border-gray-200 bg-white">
        <Link to="/" className="font-semibold text-blue-600">Home</Link>
        <Link to="/courses" className="font-semibold text-blue-600">Courses</Link>
        <Link to="/login" className="font-semibold text-blue-600">Login</Link>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
