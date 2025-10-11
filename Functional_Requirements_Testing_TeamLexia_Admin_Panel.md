# Authentication Module

## Authentication - 1: Bootstrap Code Validation

**Pre-conditions:**

- User is on login page
- No previous admin session exists
- Admin code input field is visible

**Action Description:** Enter bootstrap code `ADMINTEMP` for first-time access

**Verification Steps:**

- Confirm `ADMINTEMP` code works only once per browser session
- Confirm localStorage tracks bootstrap code usage
- Confirm successful login redirects to dashboard
- Confirm error displays on repeated use

**Test Scenario:**

| # | Data (Input Values)                        | Expected Results                            | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------------------------ | ------------------------------------------- | -------------- | ------- | ------------------ |
| 1 | Type: ADMINTEMP (first use)                | Login succeeds, redirects to Dashboard      |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Type: ADMINTEMP (second use, same browser) | Error: "Bootstrap code already used"        |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Clear browser data → Type: ADMINTEMP      | Login succeeds again (localStorage cleared) |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Leave input empty → Click login           | Error: Input validation prevents submission |                | PASSED  | RYPENGO 10/11/2025 |

---

## Authentication - 2: Generated Admin Code Login

**Pre-conditions:**

- Valid admin code exists in Firestore `adminCodes` collection
- Code is not expired and not used (if one-time)
- User is on login page

**Action Description:** Enter valid generated admin code

**Verification Steps:**

- Confirm valid active codes allow login
- Confirm expired codes show error
- Confirm used one-time codes show error
- Confirm reusable codes work multiple times

**Test Scenario:**

| # | Data (Input Values)                | Expected Results                               | Actual Results | Remarks | Group Name & Date  |
| - | ---------------------------------- | ---------------------------------------------- | -------------- | ------- | ------------------ |
| 1 | Type: Valid active code            | Login succeeds, session created                |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Type: Expired code                 | Error: "Invalid admin code"                    |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Type: One-time code (already used) | Error: "Invalid admin code"                    |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Type: Reusable code (used before)  | Login succeeds (reusable allows multiple uses) |                | PASSED  | RYPENGO 10/11/2025 |
| 5 | Type: Non-existent code            | Error: "Invalid admin code"                    |                | PASSED  | RYPENGO 10/11/2025 |

---

## Authentication - 3: Session Management

**Pre-conditions:**

- User is logged in successfully
- Session stored in localStorage

**Action Description:** Navigate pages and verify session persistence

**Verification Steps:**

- Confirm session persists for 24 hours
- Confirm session expiration redirects to login
- Confirm manual logout clears session
- Confirm protected routes check authentication

**Test Scenario:**

| # | Data (Input Values)            | Expected Results                   | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------------ | ---------------------------------- | -------------- | ------- | ------------------ |
| 1 | Login → Navigate pages        | Session active, pages accessible   |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Wait 24 hours (simulate)       | Session expires, redirect to login |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click logout button            | Session cleared, redirect to login |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Access /dashboard without auth | Redirects to login page            |                | PASSED  | RYPENGO 10/11/2025 |

---

## Authentication - 4: Password Visibility Toggle

**Pre-conditions:**

- Login page is displayed
- Admin code input field visible

**Action Description:** Click eye icon to toggle password visibility

**Verification Steps:**

- Confirm password hidden by default (dots/bullets)
- Confirm eye icon toggles visibility
- Confirm icon changes (bi-eye ↔ bi-eye-slash)

**Test Scenario:**

| # | Data (Input Values)  | Expected Results                    | Actual Results | Remarks | Group Name & Date  |
| - | -------------------- | ----------------------------------- | -------------- | ------- | ------------------ |
| 1 | Input shows dots     | Code hidden, eye-slash icon visible |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click eye icon       | Code visible as plain text          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click eye icon again | Code hidden again                   |                | PASSED  | RYPENGO 10/11/2025 |

---

# Dashboard Module

## Dashboard - 1: Statistics Cards Display

**Pre-conditions:**

- User is logged in and on Dashboard
- Firestore has user/post/appointment/verification data

**Action Description:** View dashboard statistics cards

**Verification Steps:**

- Confirm 4 stat cards display correctly
- Confirm real-time counts from Firestore
- Confirm cards show icons and color coding

**Test Scenario:**

| # | Data (Input Values)        | Expected Results                        | Actual Results | Remarks | Group Name & Date  |
| - | -------------------------- | --------------------------------------- | -------------- | ------- | ------------------ |
| 1 | View Total Users card      | Shows user count with blue background   |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View Total Posts card      | Shows post count with green background  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View Total Appointments    | Shows appointment count with orange bg  |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View Pending Verifications | Shows pending count with red background |                | PASSED  | RYPENGO 10/11/2025 |

---

## Dashboard - 2: User Growth Chart

**Pre-conditions:**

- Dashboard is loaded
- Chart.js is initialized
- User registration data exists

**Action Description:** View user growth line chart

**Verification Steps:**

- Confirm line chart displays last 30 days
- Confirm chart shows registration trend
- Confirm chart is responsive

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | View chart on page load | Line chart displays with data points |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Hover over data point   | Tooltip shows date and count         |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Resize browser window   | Chart adjusts responsively           |                | PASSED  | RYPENGO 10/11/2025 |

---

## Dashboard - 3: Role Distribution Chart

**Pre-conditions:**

- Dashboard is loaded
- User data with roles exists

**Action Description:** View role distribution doughnut chart

**Verification Steps:**

- Confirm doughnut chart displays role breakdown
- Confirm Parent vs Professional percentages
- Confirm legend displays correctly

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                      | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | ------------------------------------- | -------------- | ------- | ------------------ |
| 1 | View chart on page load  | Doughnut chart shows role percentages |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Hover over chart segment | Shows role label and count            |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View legend              | Parent and Professional labels shown  |                | PASSED  | RYPENGO 10/11/2025 |

---

## Dashboard - 4: Loading States

**Pre-conditions:**

- User navigates to Dashboard
- Data is being fetched from Firestore

**Action Description:** Observe loading animations during data fetch

**Verification Steps:**

- Confirm LoadingBar appears at top
- Confirm skeleton cards display
- Confirm smooth transition to actual data

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | Navigate to Dashboard   | LoadingBar appears during fetch      |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Data loading            | Skeleton cards pulse with animation  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Data loads successfully | Skeletons replaced with actual cards |                | PASSED  | RYPENGO 10/11/2025 |

---

# User Management Module

## User Management - 1: User List Display

**Pre-conditions:**

- User is logged in
- Users page is loaded
- Firestore has user documents

**Action Description:** View users list table

**Verification Steps:**

- Confirm table displays all users
- Confirm columns: Profile, Name, Email, Role, Verification, Created, Actions
- Confirm profile images display or fallback icons
- Confirm role badges show correct colors

**Test Scenario:**

| # | Data (Input Values) | Expected Results                            | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------------------- | -------------- | ------- | ------------------ |
| 1 | View users table    | All users display with complete information |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Check profile pics  | Images load or fallback icons show          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View role badges    | Parent (blue), Professional (green)         |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View verification   | Badges: Verified (green), Pending (yellow)  |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 2: Search Functionality

**Pre-conditions:**

- Users page is loaded
- Search input with icon is visible
- Multiple users exist in table

**Action Description:** Type search query in search input

**Verification Steps:**

- Confirm search filters by name
- Confirm search filters by email
- Confirm case-insensitive matching
- Confirm empty state displays if no matches

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                      | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | ------------------------------------- | -------------- | ------- | ------------------ |
| 1 | Type: "john"             | Shows users with "john" in name/email |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Type: "JOHN" (uppercase) | Same results (case-insensitive)       |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Type: "test@example.com" | Shows user with matching email        |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Type: "zzzznonexistent"  | "No users found" message displays     |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 3: Filter by Role

**Pre-conditions:**

- Users page is loaded
- Role filter dropdown is visible
- Users with different roles exist

**Action Description:** Select role from filter dropdown

**Verification Steps:**

- Confirm "All" shows all users
- Confirm "Parent" shows only parents
- Confirm "Professional" shows only professionals
- Confirm filter works with search

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                  | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | --------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All             | All users display                 |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Parent          | Only parent role users show       |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Professional    | Only professional role users show |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Select: Parent + Search | Parent users matching search show |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 4: Filter by Verification Status

**Pre-conditions:**

- Users page is loaded
- Verification filter dropdown is visible
- Users with different verification statuses exist

**Action Description:** Select verification status from filter

**Verification Steps:**

- Confirm "All" shows all users
- Confirm "Verified" shows verified professionals
- Confirm "Pending" shows pending professionals
- Confirm "Unverified" shows non-verified users

**Test Scenario:**

| # | Data (Input Values) | Expected Results                | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All         | All users display               |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Verified    | Only verified users show        |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Pending     | Only pending verification shows |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Select: Unverified  | Unverified users show           |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 5: View User Details

**Pre-conditions:**

- Users table is displayed
- View button (eye icon) is visible on user row

**Action Description:** Click "View" button on user row

**Verification Steps:**

- Confirm navigation to UserDetail page
- Confirm user ID in URL matches clicked user
- Confirm smooth page transition

**Test Scenario:**

| # | Data (Input Values)    | Expected Results                   | Actual Results | Remarks | Group Name & Date  |
| - | ---------------------- | ---------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click View on user row | Navigates to /users/{userId}       |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Page loads             | User details display correctly     |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View professional user | Professional details section shows |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View parent user       | Professional section shows N/A     |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 6: Delete User

**Pre-conditions:**

- Users table is displayed
- Delete button is visible on user row

**Action Description:** Click delete button and confirm deletion

**Verification Steps:**

- Confirm modal appears with user information
- Confirm "Cancel" button closes modal without deleting
- Confirm "Delete User" button removes user
- Confirm success alert displays
- Confirm table refreshes

**Test Scenario:**

| # | Data (Input Values)       | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | Click delete button       | Confirmation modal appears           |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click Cancel in modal     | Modal closes, user not deleted       |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click delete → Confirm   | User deleted, success alert shows 3s |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View table after deletion | User removed from list               |                | PASSED  | RYPENGO 10/11/2025 |

---

## User Management - 7: Edit User

**Pre-conditions:**

- UserDetail page is displayed
- "Edit User" button is visible

**Action Description:** Click "Edit User" button and modify user data

**Verification Steps:**

- Confirm navigation to UserForm page
- Confirm form pre-filled with current data
- Confirm changes save to Firestore
- Confirm success message displays

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                 | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | -------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Edit User" button | Navigates to /users/{id}/edit    |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Form displays            | All fields pre-filled with data  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Change name → Save      | User updated, redirect to detail |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Click Cancel             | Returns to detail without saving |                | PASSED  | RYPENGO 10/11/2025 |

---

# Post Management Module

## Post Management - 1: Posts List Display

**Pre-conditions:**

- User is on Posts page
- Firestore has post documents

**Action Description:** View posts list table

**Verification Steps:**

- Confirm table displays all posts
- Confirm content preview truncated to 100 chars
- Confirm author name displays
- Confirm like/comment counts visible

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                  | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | --------------------------------- | -------------- | ------- | ------------------ |
| 1 | View posts table         | All posts display with data       |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Long content (200 chars) | Shows 100 chars + "..."           |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View author column       | Author names or "Unknown" display |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View engagement metrics  | Like/comment counts show          |                | PASSED  | RYPENGO 10/11/2025 |

---

## Post Management - 2: Search Posts

**Pre-conditions:**

- Posts page is loaded
- Search input with icon is visible

**Action Description:** Type search query to filter posts

**Verification Steps:**

- Confirm search filters by content
- Confirm search filters by author name
- Confirm real-time filtering

**Test Scenario:**

| # | Data (Input Values)     | Expected Results               | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ------------------------------ | -------------- | ------- | ------------------ |
| 1 | Type: "hello"           | Shows posts containing "hello" |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Type: author name       | Shows posts by that author     |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Type: non-existent term | "No posts found" message       |                | PASSED  | RYPENGO 10/11/2025 |

---

## Post Management - 3: View Post Details

**Pre-conditions:**

- Posts table is displayed
- View button is visible on post row

**Action Description:** Click "View" button on post row

**Verification Steps:**

- Confirm navigation to PostDetail page
- Confirm full content displays
- Confirm engagement metrics card shows
- Confirm tags display if present

**Test Scenario:**

| # | Data (Input Values)  | Expected Results                    | Actual Results | Remarks | Group Name & Date  |
| - | -------------------- | ----------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click View button    | Navigates to /posts/{postId}        |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View full post       | Complete content visible            |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View engagement card | Views, Likes, Comments, Shares show |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Post has tags        | Tags display as blue badges         |                | PASSED  | RYPENGO 10/11/2025 |

---

## Post Management - 4: Delete Post

**Pre-conditions:**

- PostDetail page is displayed or in posts list
- Delete button is visible

**Action Description:** Click delete button and confirm

**Verification Steps:**

- Confirm modal displays with post preview
- Confirm deletion removes post
- Confirm redirect after deletion
- Confirm success alert

**Test Scenario:**

| # | Data (Input Values) | Expected Results                | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Delete Post" | Modal appears with preview      |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click Cancel        | Modal closes, post not deleted  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Confirm deletion    | Post deleted, redirect to list  |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View posts list     | Deleted post removed from table |                | PASSED  | RYPENGO 10/11/2025 |

---

## Post Management - 5: Reported Posts Warning

**Pre-conditions:**

- PostDetail page is displayed
- Post has reports in Firestore

**Action Description:** View post with reports

**Verification Steps:**

- Confirm red warning card displays
- Confirm report count shows
- Confirm report reasons list
- Confirm "View All Reported Posts" link works

**Test Scenario:**

| # | Data (Input Values)             | Expected Results                  | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------------- | --------------------------------- | -------------- | ------- | ------------------ |
| 1 | View post with 3 reports        | Red card shows "reported 3 times" |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View report reasons             | List shows each report reason     |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click "View All Reported Posts" | Navigates to /reported-posts      |                | PASSED  | RYPENGO 10/11/2025 |

---

# Appointment Management Module

## Appointment Management - 1: Appointments List Display

**Pre-conditions:**

- User is on Appointments page
- Firestore has appointment documents

**Action Description:** View appointments list table

**Verification Steps:**

- Confirm table displays appointments
- Confirm user and professional names show
- Confirm date/time formatted correctly
- Confirm status badges display

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                    | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ----------------------------------- | -------------- | ------- | ------------------ |
| 1 | View appointments table | All appointments display            |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View date column        | Dates formatted as "MMM DD, YYYY"   |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View status badges      | Colors: Green/Red/Blue/Yellow       |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View statistics bar     | Shows Scheduled/Completed/Cancelled |                | PASSED  | RYPENGO 10/11/2025 |

---

## Appointment Management - 2: Search Appointments

**Pre-conditions:**

- Appointments page is loaded
- Search input with icon is visible

**Action Description:** Type search query to filter appointments

**Verification Steps:**

- Confirm search filters by appointment ID
- Confirm search filters by user name
- Confirm search filters by professional name

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | Type: appointment ID    | Shows matching appointment           |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Type: user name         | Shows appointments for that user     |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Type: professional name | Shows appointments with professional |                | PASSED  | RYPENGO 10/11/2025 |

---

## Appointment Management - 3: Filter by Status

**Pre-conditions:**

- Appointments page is loaded
- Status filter dropdown is visible

**Action Description:** Select status from filter dropdown

**Verification Steps:**

- Confirm "All Status" shows all appointments
- Confirm individual statuses filter correctly
- Confirm filter works with search

**Test Scenario:**

| # | Data (Input Values) | Expected Results                 | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | -------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All Status  | All appointments display         |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Completed   | Only completed appointments show |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Pending     | Only pending appointments show   |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Select: Cancelled   | Only cancelled appointments show |                | PASSED  | RYPENGO 10/11/2025 |

---

## Appointment Management - 4: View Appointment Details

**Pre-conditions:**

- Appointments table is displayed
- View button is visible

**Action Description:** Click "View" button on appointment row

**Verification Steps:**

- Confirm navigation to AppointmentDetail page
- Confirm appointment information displays
- Confirm user and professional cards show
- Confirm clickable links to user profiles

**Test Scenario:**

| # | Data (Input Values)          | Expected Results                        | Actual Results | Remarks | Group Name & Date  |
| - | ---------------------------- | --------------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click View button            | Navigates to /appointments/{id}         |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View appointment info        | Date, status, notes display             |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click user name link         | Navigates to user's detail page         |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Click professional name link | Navigates to professional's detail page |                | PASSED  | RYPENGO 10/11/2025 |

---

# Reported Posts Module

## Reported Posts - 1: Reports List Display

**Pre-conditions:**

- User is on Reported Posts page
- Firestore has reported_posts documents

**Action Description:** View reported posts list table

**Verification Steps:**

- Confirm table displays all reports
- Confirm content preview shows
- Confirm reporter and author names display
- Confirm reason and status badges show

**Test Scenario:**

| # | Data (Input Values)  | Expected Results                 | Actual Results | Remarks | Group Name & Date  |
| - | -------------------- | -------------------------------- | -------------- | ------- | ------------------ |
| 1 | View reports table   | All reports display              |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View content preview | Shows truncated content          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View reason column   | Shows report reason              |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View status badges   | Yellow (Pending), Red (Resolved) |                | PASSED  | RYPENGO 10/11/2025 |

---

## Reported Posts - 2: Filter by Reason

**Pre-conditions:**

- Reported Posts page is loaded
- Reason filter dropdown is visible

**Action Description:** Select reason from filter dropdown

**Verification Steps:**

- Confirm "All Reasons" shows all reports
- Confirm specific reasons filter correctly
- Confirm dropdown populated with actual reasons

**Test Scenario:**

| # | Data (Input Values)   | Expected Results                | Actual Results | Remarks | Group Name & Date  |
| - | --------------------- | ------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All Reasons   | All reports display             |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Spam          | Only spam reports show          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Inappropriate | Only inappropriate reports show |                | PASSED  | RYPENGO 10/11/2025 |

---

## Reported Posts - 3: Filter by Status

**Pre-conditions:**

- Reported Posts page is loaded
- Status filter dropdown is visible

**Action Description:** Select status from filter dropdown

**Verification Steps:**

- Confirm "All Status" shows all reports
- Confirm Pending/Dismissed/Removed filter correctly
- Confirm combined filters work (reason + status + search)

**Test Scenario:**

| # | Data (Input Values)            | Expected Results                   | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------------ | ---------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All Status             | All reports display                |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Pending                | Only pending reports show          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Dismissed              | Only dismissed reports show        |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Reason: Spam + Status: Pending | Spam reports that are pending show |                | PASSED  | RYPENGO 10/11/2025 |

---

## Reported Posts - 4: View Report Details

**Pre-conditions:**

- Reported Posts table is displayed
- View button is visible

**Action Description:** Click "View" button on report row

**Verification Steps:**

- Confirm navigation to ReportedPostDetail page
- Confirm report details display
- Confirm reporter and author information shows
- Confirm "View Full Post" link works if post exists

**Test Scenario:**

| # | Data (Input Values)    | Expected Results                  | Actual Results | Remarks | Group Name & Date  |
| - | ---------------------- | --------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click View button      | Navigates to /reported-posts/{id} |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View report details    | Reason, details, date display     |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click reporter name    | Navigates to reporter's profile   |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Click "View Full Post" | Navigates to full post details    |                | PASSED  | RYPENGO 10/11/2025 |

---

## Reported Posts - 5: Delete Reported Post

**Pre-conditions:**

- ReportedPostDetail page is displayed
- Report status is pending
- "Delete Post" button is visible

**Action Description:** Click "Delete Post" button and confirm

**Verification Steps:**

- Confirm modal displays with post content
- Confirm deletion removes post from system
- Confirm report status updates
- Confirm success alert displays

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                    | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | ----------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Delete Post"      | Modal appears with warning          |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click Cancel             | Modal closes, post not deleted      |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Confirm deletion         | Post deleted, report status updated |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Try to view deleted post | Shows "Post no longer available"    |                | PASSED  | RYPENGO 10/11/2025 |

---

# Verification Requests Module

## Verification Requests - 1: Requests List Display

**Pre-conditions:**

- User is on Verification Requests page
- Firestore has verification_requests documents

**Action Description:** View verification requests list table

**Verification Steps:**

- Confirm table displays all requests
- Confirm professional credentials show
- Confirm status badges display correctly
- Confirm submission dates formatted

**Test Scenario:**

| # | Data (Input Values)     | Expected Results                   | Actual Results | Remarks | Group Name & Date  |
| - | ----------------------- | ---------------------------------- | -------------- | ------- | ------------------ |
| 1 | View requests table     | All requests display               |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View profession column  | Shows professional titles          |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View affiliation column | Shows workplace affiliations       |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View status badges      | Green (Approved), Yellow (Pending) |                | PASSED  | RYPENGO 10/11/2025 |

---

## Verification Requests - 2: Filter by Status

**Pre-conditions:**

- Verification Requests page is loaded
- Status filter dropdown is visible

**Action Description:** Select status from filter dropdown

**Verification Steps:**

- Confirm "All" shows all requests
- Confirm "Pending" shows only pending
- Confirm "Approved" shows approved
- Confirm "Rejected" shows rejected

**Test Scenario:**

| # | Data (Input Values) | Expected Results            | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | --------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: All         | All requests display        |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Pending     | Only pending requests show  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Select: Approved    | Only approved requests show |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Select: Rejected    | Only rejected requests show |                | PASSED  | RYPENGO 10/11/2025 |

---

## Verification Requests - 3: Filter by Profession

**Pre-conditions:**

- Verification Requests page is loaded
- Profession filter dropdown is visible

**Action Description:** Select profession from filter dropdown

**Verification Steps:**

- Confirm dropdown shows unique professions
- Confirm filtering works correctly
- Confirm combined with status filter

**Test Scenario:**

| # | Data (Input Values)        | Expected Results             | Actual Results | Remarks | Group Name & Date  |
| - | -------------------------- | ---------------------------- | -------------- | ------- | ------------------ |
| 1 | View profession dropdown   | Shows all unique professions |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: Therapist          | Only therapist requests show |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Profession + Status filter | Combines both filters        |                | PASSED  | RYPENGO 10/11/2025 |

---

## Verification Requests - 4: View Request Details

**Pre-conditions:**

- Verification Requests table is displayed
- View button is visible

**Action Description:** Click "View" button on request row

**Verification Steps:**

- Confirm navigation to detail page
- Confirm credentials information displays
- Confirm user link works
- Confirm action buttons show for pending requests

**Test Scenario:**

| # | Data (Input Values)  | Expected Results                       | Actual Results | Remarks | Group Name & Date  |
| - | -------------------- | -------------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click View button    | Navigates to detail page               |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View credentials     | Profession, affiliation, email display |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Click user name link | Navigates to user's profile            |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Pending request      | Shows Approve and Reject buttons       |                | PASSED  | RYPENGO 10/11/2025 |

---

## Verification Requests - 5: Approve Request

**Pre-conditions:**

- VerificationRequestDetail page is displayed
- Request status is pending
- "Approve" button is visible

**Action Description:** Click "Approve" button and confirm

**Verification Steps:**

- Confirm modal displays action details
- Confirm approval updates request status
- Confirm user's verificationStatus updates
- Confirm success alert displays

**Test Scenario:**

| # | Data (Input Values) | Expected Results                | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Approve"     | Confirmation modal appears      |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click Cancel        | Modal closes, no changes        |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Confirm approval    | Request approved, user verified |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View user profile   | Shows "Verified" badge          |                | PASSED  | RYPENGO 10/11/2025 |

---

## Verification Requests - 6: Reject Request

**Pre-conditions:**

- VerificationRequestDetail page is displayed
- Request status is pending
- "Reject" button is visible

**Action Description:** Click "Reject" button and confirm

**Verification Steps:**

- Confirm modal displays action details
- Confirm rejection updates request status
- Confirm user's verificationStatus updates
- Confirm success alert displays

**Test Scenario:**

| # | Data (Input Values) | Expected Results                 | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | -------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Reject"      | Confirmation modal appears       |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Confirm rejection   | Request rejected, status updated |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View user profile   | Shows "Rejected" status          |                | PASSED  | RYPENGO 10/11/2025 |

---

# Admin Codes Management Module

## Admin Codes - 1: Admin Codes List Display

**Pre-conditions:**

- User is on Admin Codes page
- Firestore has adminCodes documents

**Action Description:** View admin codes list table

**Verification Steps:**

- Confirm table displays all codes
- Confirm code partially masked for security
- Confirm type badges display (One-Time/Reusable)
- Confirm status badges with countdown timers

**Test Scenario:**

| # | Data (Input Values) | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | View codes table    | All codes display in monospace font  |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View code display   | Shows partial mask (e.g., ABC***FG)  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View type badges    | Blue (One-Time), Purple (Reusable)   |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View status badges  | Green/Yellow/Red with time remaining |                | PASSED  | RYPENGO 10/11/2025 |

---

## Admin Codes - 2: Filter Admin Codes

**Pre-conditions:**

- Admin Codes page is loaded
- Filter dropdowns are visible

**Action Description:** Select filters for status and type

**Verification Steps:**

- Confirm status filter works (All/Active/Expired/Used)
- Confirm type filter works (All/One-Time/Reusable)
- Confirm search by code string works
- Confirm combined filters work together

**Test Scenario:**

| # | Data (Input Values)         | Expected Results                    | Actual Results | Remarks | Group Name & Date  |
| - | --------------------------- | ----------------------------------- | -------------- | ------- | ------------------ |
| 1 | Select: Active status       | Only active codes show              |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Select: One-Time type       | Only one-time codes show            |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Type: code prefix in search | Shows matching codes                |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | Status + Type + Search      | All three filters combine correctly |                | PASSED  | RYPENGO 10/11/2025 |

---

## Admin Codes - 3: Copy Code to Clipboard

**Pre-conditions:**

- Admin Codes table is displayed
- Copy icon is visible next to code

**Action Description:** Click copy icon to copy full code

**Verification Steps:**

- Confirm full unmasked code copied
- Confirm "Code copied!" notification displays
- Confirm clipboard contains correct code

**Test Scenario:**

| # | Data (Input Values)  | Expected Results              | Actual Results | Remarks | Group Name & Date  |
| - | -------------------- | ----------------------------- | -------------- | ------- | ------------------ |
| 1 | Click copy icon      | Full code copied to clipboard |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Notification appears | Shows "Code copied!" message  |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Paste clipboard      | Full unmasked code pastes     |                | PASSED  | RYPENGO 10/11/2025 |

---

## Admin Codes - 4: Generate New Admin Code

**Pre-conditions:**

- Admin Codes page is displayed
- "Generate New Code" button is visible

**Action Description:** Click "Generate New Code" and configure settings

**Verification Steps:**

- Confirm modal opens with form
- Confirm expiration duration can be set
- Confirm code type (one-time/reusable) can be chosen
- Confirm code generates and saves to Firestore

**Test Scenario:**

| # | Data (Input Values)               | Expected Results                     | Actual Results | Remarks | Group Name & Date  |
| - | --------------------------------- | ------------------------------------ | -------------- | ------- | ------------------ |
| 1 | Click "Generate New Code"         | Modal opens with form                |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Set: 24 hours, One-Time           | Code generated with settings         |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Set: 168 hours (1 week), Reusable | Code generated as reusable           |                | PASSED  | RYPENGO 10/11/2025 |
| 4 | View new code in table            | Code appears with correct settings   |                | PASSED  | RYPENGO 10/11/2025 |
| 5 | Copy generated code               | Full 8-char code copied successfully |                | PASSED  | RYPENGO 10/11/2025 |

---

## Admin Codes - 5: Delete Admin Code

**Pre-conditions:**

- Admin Codes table is displayed
- Delete icon is visible on code row

**Action Description:** Click delete icon and confirm deletion

**Verification Steps:**

- Confirm modal displays code information
- Confirm deletion removes code from Firestore
- Confirm table refreshes
- Confirm success alert displays

**Test Scenario:**

| # | Data (Input Values) | Expected Results               | Actual Results | Remarks | Group Name & Date  |
| - | ------------------- | ------------------------------ | -------------- | ------- | ------------------ |
| 1 | Click delete icon   | Confirmation modal appears     |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | Click Cancel        | Modal closes, code not deleted |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | Confirm deletion    | Code deleted, table refreshes  |                | PASSED  | RYPENGO 10/11/2025 |

---

## Admin Codes - 6: Cleanup Expired Codes

**Pre-conditions:**

- Admin Codes page is displayed
- "Cleanup Expired" button is visible
- Expired codes exist in system

**Action Description:** Click "Cleanup Expired" button

**Verification Steps:**

- Confirm batch operation removes expired codes
- Confirm used one-time codes also removed
- Confirm success message shows count removed
- Confirm table refreshes

**Test Scenario:**

| # | Data (Input Values)      | Expected Results                | Actual Results | Remarks | Group Name & Date  |
| - | ------------------------ | ------------------------------- | -------------- | ------- | ------------------ |
| 1 | Click "Cleanup Expired"  | All expired codes removed       |                | PASSED  | RYPENGO 10/11/2025 |
| 2 | View success message     | Shows "X codes cleaned up"      |                | PASSED  | RYPENGO 10/11/2025 |
| 3 | View table after cleanup | Only active/unused codes remain |                | PASSED  | RYPENGO 10/11/2025 |

---
