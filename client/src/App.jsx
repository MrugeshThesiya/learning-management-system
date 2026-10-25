import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:10,borderBottom:'1px solid #ddd'}}>
        <Link to="/" style={{marginRight:10}}>Home</Link>
        <Link to="/courses" style={{marginRight:10}}>Courses</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
