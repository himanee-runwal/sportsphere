# SportSphere Frontend Design & Architecture Specification (FDS)

> **Version:** 1.0  
> **Project:** SportSphere  
> **Document Type:** Frontend Design & Architecture Specification (FDS)  
> **Target Audience:** AI Development Agent / Frontend Developers

---

# 1. Project Vision

## Overview

SportSphere is a modern sports venue booking and community management platform inspired by platforms like **Playo**.

The platform enables users to:

- Discover sports venues
- Book sports slots
- Participate in tournaments
- Manage venues
- View booking history
- Build sports communities

The frontend should resemble a **production-grade SaaS application**, not a beginner-level college project.

---

# 2. Development Principles

The development agent **must follow these principles throughout the project.**

## Enterprise Codebase

- Write production-quality React code.
- Follow scalable architecture.
- Avoid beginner coding patterns.
- Every feature should be modular and reusable.

---

## Separation of Concerns

Separate responsibilities properly.

- UI Components
- Pages
- Layouts
- API Layer
- Services
- Hooks
- Context
- Utilities

Business logic must never be mixed with UI.

---

## No Backend Assumptions

The frontend **must not assume** backend APIs.

Never:

- Invent endpoints
- Invent request payloads
- Invent response objects

Whenever backend information is unavailable:

**Stop implementation and request the API contract.**

---

## Reusability First

Before creating any component ask:

> Can this component be reused?

If yes, place it inside the reusable component library.

---

# 3. Technology Stack

## Framework

- React 19

## Build Tool

- Vite

## Routing

- React Router v7

## HTTP Client

- Axios

## Styling

- Bootstrap 5

## Forms

- React Hook Form

## Validation

- Yup

## State Management

- Context API

## Authentication

- JWT

## Notifications

- React Toastify

## Icons

- React Icons

---

# 4. Design Philosophy

The application should communicate:

- Professionalism
- Simplicity
- Performance
- Trust
- Community

Avoid:

- Flashy gradients
- Gaming aesthetics
- Neon colors
- Excessive animations

Design inspiration:

- Playo
- Airbnb
- Stripe Dashboard
- Notion
- Atlassian
- Linear

---

# 5. Brand Identity

## Brand Name

**SportSphere**

## Tagline

> **Play Together. Book Smarter.**

## Brand Personality

- Modern
- Professional
- Athletic
- Community Driven
- Reliable

---

# 6. Design Language

The UI should follow a **Minimal Corporate Design System**.

Characteristics:

- Large whitespace
- Flat UI
- Soft shadows
- Rounded corners
- Consistent spacing
- Minimal animations
- Strong visual hierarchy

---

# 7. Color Palette

| Purpose | Color |
|----------|--------|
| Primary | `#0F766E` |
| Secondary | `#1E293B` |
| Accent | `#F59E0B` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Text Primary | `#0F172A` |
| Text Secondary | `#64748B` |
| Border | `#E2E8F0` |
| Success | `#16A34A` |
| Warning | `#D97706` |
| Danger | `#DC2626` |

---

# 8. Typography

## Font Family

Inter

Fallback:

```css
font-family: "Inter", sans-serif;
```

## Font Weights

| Element | Weight |
|----------|---------|
| Heading | 700 |
| Sub Heading | 600 |
| Body | 400 |
| Buttons | 600 |

---

# 9. Spacing System

Use only the following spacing values.

```text
4px
8px
16px
24px
32px
48px
64px
80px
96px
```

Never use arbitrary spacing values.

---

# 10. Border Radius

| Component | Radius |
|------------|---------|
| Buttons | 10px |
| Cards | 12px |
| Inputs | 8px |
| Modal | 16px |
| Badge | 999px |

---

# 11. Shadows

Use only three shadow levels.

## Small

Cards

## Medium

Hover State

## Large

Modals

Avoid heavy shadows.

---

# 12. Icons

Use:

React Icons

Preferred Pack:

Bootstrap Icons

Maintain consistent icon sizing.

---

# 13. Responsive Design

Use Bootstrap breakpoints.

Support:

- Mobile
- Tablet
- Laptop
- Desktop

Rules:

- No horizontal scrolling
- Responsive grids
- Mobile-friendly navigation
- Touch-friendly controls

---

# 14. Layout System

## Public Layout

Contains:

- Navbar
- Main Content
- Footer

---

## Dashboard Layout

Contains:

- Sidebar
- Header
- Breadcrumb
- Main Content
- Footer

---

# 15. Navigation

## Public

- Home
- Sports
- Venues
- Tournaments
- Login
- Register

---

## User

- Dashboard
- Bookings
- Profile
- Logout

---

## Admin

- Dashboard
- Users
- Sports
- Venues
- Tournaments
- Bookings

---

## Venue Owner

- Dashboard
- My Venues
- Slots
- Bookings

---

# 16. Component Rules

Every component must:

- Have one responsibility
- Be reusable
- Accept props
- Avoid hardcoded values
- Avoid inline CSS
- Be responsive

---

# 17. Component Library

## Common

- Navbar
- Footer
- Sidebar
- Loader
- Button
- Modal
- SearchBar
- Pagination

---

## Sports

- SportCard
- VenueCard
- SlotCard

---

## Booking

- BookingCard

---

## Authentication

- LoginForm
- RegisterForm

---

# 18. Folder Structure

```text
src/
│
├── api/
│   ├── axios.js
│   ├── authApi.js
│   ├── sportsApi.js
│   └── bookingApi.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── components/
│   ├── common/
│   ├── auth/
│   ├── sports/
│   └── booking/
│
├── constants/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
│
├── App.jsx
└── main.jsx
```

Every folder must have a clearly defined responsibility.

---

# 19. Routing

Use:

React Router v7

Separate routing into:

- Public Routes
- Protected Routes
- Role-Based Routes

Never define routes inside page components.

---

# 20. Authentication

Authentication uses:

- JWT Access Token
- Refresh Token

Requirements:

- Context API
- Axios Interceptors
- Protected Routes
- Role-Based Navigation

Never expose protected pages without authentication.

---

# 21. API Layer

All HTTP communication must go through Axios.

Structure:

```text
api/
    axios.js
    authApi.js
    sportsApi.js
    bookingApi.js
```

Never call Axios directly inside components.

---

# 22. Error Handling

Provide centralized error handling.

Display:

- Toast notifications
- Friendly error messages

Never expose raw backend errors.

---

# 23. Loading States

Every async operation must include:

- Loading spinner
- Disabled buttons
- Empty state
- Error state

---

# 24. Forms

Use:

- React Hook Form
- Yup

Every form must include:

- Validation
- Error messages
- Disabled submit button while loading

---

# 25. Accessibility

Follow accessibility best practices.

Requirements:

- Semantic HTML
- Proper labels
- Keyboard navigation
- Color contrast
- ARIA attributes where necessary

---

# 26. Performance

Use:

- Lazy loading
- Code splitting
- Memoization when required
- Optimized images

Avoid unnecessary re-renders.

---

# 27. Backend Integration

The frontend will integrate with the following Spring Boot microservices:

- API Gateway
- Eureka Server
- Auth Service
- Sports Service
- Booking Service
- Notification Service

The frontend architecture must remain independent of backend implementation details.

No backend assumptions are allowed.

---

# 28. Development Workflow

The AI agent **must not generate the entire application at once.**

Development order:

1. Project Setup
2. Design System
3. Routing
4. Layouts
5. Common Components
6. Landing Page
7. Authentication
8. Dashboard
9. Sports Module
10. Venue Module
11. Booking Module
12. Tournament Module
13. Profile Module
14. Admin Module
15. Venue Owner Module
16. API Integration
17. Testing
18. Optimization

After every completed phase:

- Explain implementation.
- Wait for approval.
- Do not continue automatically.

---

# 29. Coding Standards

- Functional Components only
- React Hooks only
- No inline CSS
- Reusable components
- Meaningful naming conventions
- Avoid duplicate code
- Keep components focused and maintainable
- Use comments only where they add value

---

# 30. Definition of Done

A feature is considered complete only if:

- ✅ Responsive
- ✅ Follows design system
- ✅ Uses reusable components
- ✅ Includes loading state
- ✅ Includes empty state
- ✅ Includes error state
- ✅ Has validation where applicable
- ✅ Meets accessibility standards
- ✅ Ready for backend integration

---

# 31. Instructions for the Development Agent

This document is the **single source of truth** for the SportSphere frontend.

The development agent must:

- Follow this specification throughout the project.
- Never invent backend APIs or data structures.
- Request API contracts before implementing integrations.
- Follow the design system consistently.
- Build reusable, scalable, and maintainable components.
- Prioritize production-quality architecture over rapid implementation.
- Complete one feature at a time and wait for approval before proceeding.