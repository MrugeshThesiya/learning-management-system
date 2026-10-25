import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseCard, { coverFor, canManage, initials } from './CourseCard.jsx';

const course = { id: 4, title: 'Full-Stack Web Development', description: 'Ship apps', instructor_name: 'Ian Instructor', instructor_id: 2, lessons_count: 6, students: 1, is_published: true };
const renderCard = (props) => render(<MemoryRouter><CourseCard course={course} {...props} /></MemoryRouter>);

describe('helpers', () => {
  it('builds initials from the first two words', () => {
    expect(initials('Full-Stack Web Development')).toBe('FW');
    expect(initials('Python')).toBe('P');
    expect(initials('')).toBe('?');
  });

  it('only lets admins and owning instructors manage a course', () => {
    expect(canManage({ role: 'admin', id: 9 }, course)).toBe(true);
    expect(canManage({ role: 'instructor', id: 2 }, course)).toBe(true);
    expect(canManage({ role: 'instructor', id: 3 }, course)).toBe(false);
    expect(canManage({ role: 'student', id: 2 }, course)).toBe(false);
    expect(canManage(null, course)).toBe(false);
  });

  it('uses a stable, muted cover palette (no pink or magenta)', () => {
    expect(coverFor(4)).toBe(coverFor(4));
    for (let id = 0; id < 12; id++) {
      expect(coverFor(id)).not.toMatch(/pink|fuchsia|rose/);
    }
  });
});

describe('<CourseCard />', () => {
  it('shows course details and enrolls on click', async () => {
    const onEnroll = vi.fn();
    renderCard({ onEnroll });
    expect(screen.getByRole('link', { name: course.title })).toHaveAttribute('href', '/courses/4');
    expect(screen.getByText('Ian Instructor')).toBeInTheDocument();
    expect(screen.getByText('6 lessons')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enroll' }));
    expect(onEnroll).toHaveBeenCalledWith(course);
  });

  it('shows progress and a continue link for enrolled students', () => {
    renderCard({ enrolled: true, progress: 66.4 });
    expect(screen.getByText('66%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enroll' })).not.toBeInTheDocument();
  });

  it('shows a manage link instead of enrolling for owners', () => {
    renderCard({ manageable: true });
    expect(screen.getByRole('link', { name: 'Manage' })).toHaveAttribute('href', '/courses/4/manage');
    expect(screen.queryByRole('button', { name: 'Enroll' })).not.toBeInTheDocument();
  });

  it('labels drafts', () => {
    render(<MemoryRouter><CourseCard course={{ ...course, is_published: false }} /></MemoryRouter>);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
