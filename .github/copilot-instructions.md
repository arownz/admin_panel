# TeamLexia Admin Panel - AI Coding Agent Instructions

## Project Overview

This is a **Firebase-powered React admin panel** for managing the TeamLexia mobile app (parent-professional platform). Built with React 19, Vite 6, Firebase 10, Bootstrap 5, and Chart.js 4. Deployed at: https://gamedevcapz-admin.web.app/

## Architecture & Data Flow

### Authentication System (Non-Firebase Auth)

- **Custom localStorage-based auth** (24-hour sessions) - NOT using Firebase Authentication
- Bootstrap code: `ADMINTEMP` (one-time per browser session, stored in `localStorage.admintemp_used`)
- Generated codes: Time-limited (1h-1w), one-time or reusable, stored in `adminCodes` Firestore collection
- Login flow: `Login.jsx` → `validateAdminCode()` → `AuthContext.login()` → localStorage (`adminAuthCode`, `adminAuthTime`)
- Protected routes wrap all pages via `<ProtectedRoute>` component checking `isAuthenticated` from `AuthContext`

### Firebase Service Layer (`src/firebase/services.js`)

**Central data access layer** - ALL Firestore operations go through this file (845 lines, 35+ exported functions):

- **Real-time listeners**: `getUsersRealtime()`, `getUser()` use `onSnapshot()` - MUST return unsubscribe function
- **One-time reads**: `getUsers()`, `getAppointments()`, `getPosts()` use `getDocs()`
- **Timestamp handling**: `convertTimestamp()` handles 3 formats: Firestore Timestamp objects, `{seconds}` objects, raw dates
- **Admin codes**: `generateAdminCode()` creates 8-char alphanumeric codes, `cleanupExpiredCodes()` removes expired + used one-time codes
- **Verification flow**: `updateVerificationStatus()` updates BOTH `verification_requests` collection AND syncs `users.verificationStatus`

### Component Structure Pattern

```
src/components/
  auth/Login.jsx          # Public route
  Dashboard.jsx           # Analytics with Chart.js
  Sidebar.jsx             # Global nav with useSidebar context
  ProtectedRoute.jsx      # Auth wrapper
  [entity]/
    [Entity]s.jsx         # List view (Users, Posts, etc.)
    [Entity]Detail.jsx    # Read-only detail
    [Entity]Form.jsx      # Edit form (optional)
```

**Every list component follows this pattern:**

1. State: `[items, filteredItems, searchTerm, statusFilter, loading, error, success]`
2. `useEffect` #1: Fetch data (call Firebase service)
3. `useEffect` #2: Client-side filtering based on filters/search
4. `useEffect` #3 & #4: Auto-dismiss alerts (success: 3s, error: 5s)
5. Table with Bootstrap `<Table hover>` + status badges + action buttons

## Critical Conventions

### Date/Timestamp Handling (REQUIRED PATTERN)

```javascript
// Always use this helper in components displaying dates
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    let date;
    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      /* format options */
    });
  } catch {
    return "Invalid date";
  }
};
```

**Why**: Firestore timestamps come in multiple formats depending on source (server vs client, cached vs fresh).

### Alert Auto-Dismiss Pattern

```javascript
// Add to ALL components with success/error states
useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timer);
  }
}, [success]);

useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

### Filter Logic Pattern (Users, Verification, Posts, etc.)

```javascript
useEffect(() => {
  let filtered = [...items];

  // Apply each filter sequentially
  if (statusFilter !== "all") {
    filtered = filtered.filter((item) => item.status === statusFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  setFilteredItems(filtered);
}, [items, statusFilter, searchTerm]);
```

**Key**: Filters must check exact status values, not partial matches. Pending verification is `verificationStatus === 'pending'`, not `!isVerified`.

## Firestore Collections

- `users` - Hybrid roles: `{role: 'parent'|'professional', isVerified, verificationStatus: 'pending'|'verified'|'rejected'}`
- `verification_requests` - Professional credential submissions: `{userId, profession, affiliation, workEmail, status, submittedAt}`
- `appointments` - User-professional bookings: `{userName, professionalName, appointmentTime, status, createdAt}`
- `posts` - User-generated content: `{content, authorName, category, likeCount, commentCount, createdAt}`
- `reported_posts` - Content moderation queue: `{postId, reportedBy, reason, status: 'pending'|'rejected'|'deleted', reportedAt}`
- `adminCodes` - Auth codes: `{code, generatedAt, expiresAt, isOneTime, isUsed, usedAt}`

## Development Workflow

### Running the App

```bash
npm run dev              # Start dev server (default: http://localhost:5173)
npm run build            # Production build to dist/
npm run preview          # Preview production build
npm run lint             # ESLint check
```

### Testing Changes

1. Login with `ADMINTEMP` (first time only per browser session)
2. Generate admin codes via Admin Codes page for subsequent logins
3. Real-time listeners update UI automatically (Users page shows live changes)
4. Check browser console for Firebase operation logs

### Common Pitfalls

- ❌ DON'T use `new Date(firestoreTimestamp)` directly - use `formatDate()` helper
- ❌ DON'T forget unsubscribe functions for `onSnapshot()` listeners
- ❌ DON'T create new Firebase service functions - extend `services.js`
- ❌ DON'T use Firebase Auth API - this project uses custom localStorage auth
- ✅ DO add auto-dismiss to all success/error alerts
- ✅ DO use `serverTimestamp()` for Firestore writes, not `new Date()`
- ✅ DO preserve existing filter logic patterns when modifying list views

## UI/UX Standards

- Bootstrap 5 components: `<Alert>`, `<Badge>`, `<Table>`, `<Modal>`, `<Spinner>`
- Bootstrap Icons: `bi-*` classes for all icons (loaded via CDN in App.css)
- Color scheme: Primary `#4361ee`, Success `#4dd4ac`, Danger `#ef476f`, Warning `#ffd166`
- Sidebar: Collapsible via `useSidebar()` context, 250px → 70px
- Loading states: Bootstrap Spinner with "Loading..." text
- Empty states: Large icon + "No {entity} found" message
- Action buttons: `<i className="bi-eye">` (view), `bi-pencil` (edit), `bi-trash` (delete)

## Key Files for Context

- `src/App.jsx` - Route definitions (15 protected routes)
- `src/firebase/services.js` - All Firestore CRUD operations
- `src/contexts/AuthContext.jsx` - Session management logic
- `src/components/Sidebar.jsx` - Global navigation structure
- `src/App.css` - CSS variables and component styles (593 lines)

## Firebase Config

Project: `gamedevcapz` | Collections: 6 main entities | No Firebase Auth enabled (custom implementation)
