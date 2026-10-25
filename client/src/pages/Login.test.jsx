import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';

const calls = [];
let outcome = () => Promise.resolve({ id: 1, role: 'student' });
const login = (...args) => { calls.push(args); return outcome(); };
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => ({ login }) }));

const renderLogin = () => render(
  <ThemeProvider>
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
      </Routes>
    </MemoryRouter>
  </ThemeProvider>
);

beforeEach(() => { calls.length = 0; outcome = () => Promise.resolve({ id: 1, role: 'student' }); });

describe('<Login />', () => {
  it('asks for both fields before calling the API', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Enter your email and password.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('signs in and goes to the dashboard', async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'demo@learnova.app');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(screen.getByText('Dashboard page')).toBeInTheDocument());
    expect(calls).toEqual([['demo@learnova.app', 'password123']]);
  });

  it('shows the server error when sign-in fails', async () => {
    outcome = () => Promise.reject(new Error('Invalid credentials'));
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'demo@learnova.app');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });
});
