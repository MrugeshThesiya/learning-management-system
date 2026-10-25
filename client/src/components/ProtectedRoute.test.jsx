import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RequireRole, GuestOnly } from './ProtectedRoute.jsx';

const auth = { status: 'guest', user: null };
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => auth }));

const setAuth = (status, role) => { auth.status = status; auth.user = role ? { id: 1, role } : null; };
const app = (element, path = '/secret') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/secret" element={element} />
      <Route path="/login" element={<p>Login page</p>} />
      <Route path="/dashboard" element={<p>Dashboard page</p>} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => setAuth('guest'));

describe('ProtectedRoute', () => {
  it('sends guests to the login page', () => {
    app(<ProtectedRoute><p>Secret</p></ProtectedRoute>);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('waits while the session is being checked', () => {
    setAuth('loading');
    app(<ProtectedRoute><p>Secret</p></ProtectedRoute>);
    expect(screen.getByText(/Checking your session/)).toBeInTheDocument();
  });

  it('renders children for signed-in users', () => {
    setAuth('authenticated', 'student');
    app(<ProtectedRoute><p>Secret</p></ProtectedRoute>);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('RequireRole', () => {
  it('allows a matching role and redirects the rest to the dashboard', () => {
    setAuth('authenticated', 'instructor');
    const { unmount } = app(<RequireRole roles={['instructor', 'admin']}><p>Studio</p></RequireRole>);
    expect(screen.getByText('Studio')).toBeInTheDocument();
    unmount();

    setAuth('authenticated', 'student');
    app(<RequireRole roles={['instructor', 'admin']}><p>Studio</p></RequireRole>);
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });
});

describe('GuestOnly', () => {
  it('keeps signed-in users out of the login and register pages', () => {
    setAuth('authenticated', 'student');
    app(<GuestOnly><p>Sign in form</p></GuestOnly>);
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('shows the form to guests', () => {
    app(<GuestOnly><p>Sign in form</p></GuestOnly>);
    expect(screen.getByText('Sign in form')).toBeInTheDocument();
  });
});
