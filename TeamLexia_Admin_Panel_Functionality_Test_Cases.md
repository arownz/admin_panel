# Functionality Test Case - TeamLexia Admin Panel Super Admin System

## Authentication Tests

| **Runs**                              | **Expected Results**                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| Login Screen Access (Authentication) - 1    | Navigate to admin panel URL displays login interface with authentication code input |
| Bootstrap Code Login (Authentication) - 2   | Input "ADMINTEMP" code authenticates and navigates to dashboard                     |
| Generated Code Login (Authentication) - 3   | Input 8-character admin code validates and grants access                            |
| Invalid Code Handling (Authentication) - 4  | Invalid code displays error message with red alert                                  |
| Empty Field Validation (Authentication) - 5 | Empty field shows validation error message                                          |
| Session Lock (Authentication) - 6           | Second use of ADMINTEMP in same session shows error                                 |
| Loading State (Authentication) - 7          | Login button shows spinner during authentication                                    |
|                                             |                                                                                     |

## Sidebar Navigation Tests

| **Runs**                              | **Expected Results**                            |
| ------------------------------------------- | ----------------------------------------------------- |
| Sidebar Display (Navigation) - 1            | Sidebar shows branding and navigation menu items      |
| Sidebar Toggle (Navigation) - 2             | Chevron icon collapses/expands sidebar                |
| Dashboard Navigation (Navigation) - 3       | Dashboard menu navigates to overview page             |
| User Management Navigation (Navigation) - 4 | User Management menu navigates to users table         |
| Verification Navigation (Navigation) - 5    | Verification Requests navigates to verification queue |
| Appointments Navigation (Navigation) - 6    | Appointments menu navigates to appointment table      |
| Posts Navigation (Navigation) - 7           | Posts menu navigates to content management            |
| Reported Posts Navigation (Navigation) - 8  | Reported Posts navigates to moderation queue          |
| Admin Codes Navigation (Navigation) - 9     | Admin Codes navigates to code management              |
| Logout Confirmation (Navigation) - 10       | Logout button shows confirmation modal                |
| Logout Execution (Navigation) - 11          | Confirm logout redirects to login page                |

## Dashboard Overview Tests

| **Runs**                     | **Expected Results**                              |
| ---------------------------------- | ------------------------------------------------------- |
| Dashboard Loading (Dashboard) - 1  | Dashboard displays loading spinner then stat cards      |
| Statistics Cards (Dashboard) - 2   | Shows 4 main cards: Users, Appointments, Posts, Reports |
| Users Counter (Dashboard) - 3      | Displays current user count and monthly growth          |
| Appointments Stats (Dashboard) - 4 | Shows total and completed appointments                  |
| Posts Counter (Dashboard) - 5      | Displays total content count                            |
| Reports Alert (Dashboard) - 6      | Shows reported posts count with warning                 |
| Bar Chart (Dashboard) - 7          | Renders statistics as Chart.js bar chart                |
| Recent Tables (Dashboard) - 8      | Shows recent users, appointments, and posts             |
| Navigation Links (Dashboard) - 9   | "View All" buttons navigate to detail pages             |

## User Management Tests

| **Runs**                               | **Expected Results**                            |
| -------------------------------------------- | ----------------------------------------------------- |
| Users List Loading (User Management) - 1     | Users page displays table with Firebase user data     |
| User Search (User Management) - 2            | Search field filters users by name, email, profession |
| Role Filter (User Management) - 3            | Filter by Parents or Professionals                    |
| Verification Filter (User Management) - 4    | Filter by Verified, Pending, Unverified status        |
| Profile Pictures (User Management) - 5       | Shows avatars or default person icon                  |
| Verification Badges (User Management) - 6    | Color-coded status badges for verification            |
| User Actions (User Management) - 7           | View, edit, delete buttons for each user              |
| User Detail Navigation (User Management) - 8 | Eye icon navigates to user profile                    |
| User Edit (User Management) - 9              | Edit icon opens user form                             |
| User Delete (User Management) - 10           | Delete shows confirmation dialog                      |

## User Detail View Tests

| **Runs**                               | **Expected Results**                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| User Detail Loading (User Detail) - 1        | Navigate to user detail displays loading spinner, then renders complete user profile information |
| Profile Information Panel (User Detail) - 2  | Shows user's profile picture, name, email, role badge, verification status, and join date        |
| Professional Credentials (User Detail) - 3   | Professional users display profession, affiliation, license numbers, and verification documents  |
| User Activity Timeline (User Detail) - 4     | Shows user's activity history including posts, appointments, and verification requests           |
| Edit User Navigation (User Detail) - 5       | "Edit User" button navigates to user edit form with current user data pre-populated              |
| Back to Users Navigation (User Detail) - 6   | "Back to Users" button returns to users list maintaining previous search and filter state        |
| Verification Status Update (User Detail) - 7 | For professionals, shows verification workflow status and admin action history                   |
| User Statistics Display (User Detail) - 8    | Displays user engagement metrics: posts count, appointments count, and activity level            |

## User Form/Edit Tests

| **Runs**                           | **Expected Results**                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| User Edit Form Loading (User Form) - 1   | Navigate to user edit displays form with all fields populated from Firebase user data           |
| Name Field Editing (User Form) - 2       | Edit name input field allows text entry with real-time validation for required field            |
| Email Field Validation (User Form) - 3   | Email field validates format and shows error for invalid email addresses                        |
| Role Selection Dropdown (User Form) - 4  | Role dropdown allows selection between "Parent" and "Professional" with proper state management |
| Status Selection Control (User Form) - 5 | Status dropdown enables selection between "Active", "Inactive", and other status options        |
| Form Validation Display (User Form) - 6  | Invalid form data shows red validation messages below respective fields                         |
| Save Changes Action (User Form) - 7      | Click "Save Changes" button shows loading state, updates Firebase, and displays success message |
| Cancel Changes Action (User Form) - 8    | Click "Cancel" button discards changes and returns to user detail or users list                 |
| Loading State Management (User Form) - 9 | During form submission, save button shows spinner and "Saving..." text with disabled state      |
| Success Confirmation (User Form) - 10    | Successful save displays green alert "User updated successfully" and refreshes data             |

## Verification Requests Tests

| **Runs**                       | **Expected Results**                          |
| ------------------------------------ | --------------------------------------------------- |
| Verification List (Verification) - 1 | Shows table with professional verification requests |
| Search Function (Verification) - 2   | Filters by email, profession, affiliation           |
| Status Filter (Verification) - 3     | Filters by Pending, Approved, Rejected              |
| Detail Navigation (Verification) - 4 | Eye icon shows request details                      |
| Quick Approve (Verification) - 5     | Checkmark button approves verification              |
| Quick Reject (Verification) - 6      | X button rejects verification                       |
| Status Badges (Verification) - 7     | Color-coded status indicators                       |

## Verification Request Detail Tests

| **Runs**                                           | **Expected Results**                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Request Detail Loading (Verification Detail) - 1         | Navigate to request detail displays complete professional verification information |
| Professional Information Panel (Verification Detail) - 2 | Shows submitted credentials: profession, work email, affiliation, license numbers  |
| Document Attachments Display (Verification Detail) - 3   | Displays uploaded certificates, licenses, and identification documents             |
| Approval Action Interface (Verification Detail) - 4      | "Approve" button opens notes input, updates Firebase user verification status      |
| Rejection Action Interface (Verification Detail) - 5     | "Reject" button opens reason input, records admin decision with timestamp          |
| Admin Notes Input Field (Verification Detail) - 6        | Text area allows detailed admin comments for verification decision                 |
| Status Change Confirmation (Verification Detail) - 7     | Confirmation modal shows before status change with decision summary                |
| Back Navigation Control (Verification Detail) - 8        | "Back to Verification Requests" returns to list maintaining filter state           |

## Appointments Management Tests

| **Runs**                       | **Expected Results**                  |
| ------------------------------------ | ------------------------------------------- |
| Appointments List (Appointments) - 1 | Shows table with user-professional bookings |
| Search Function (Appointments) - 2   | Filters by user, professional, details      |
| Status Filter (Appointments) - 3     | Filters by Scheduled, Completed, Cancelled  |
| Date Filter (Appointments) - 4       | Date picker filters by date ranges          |
| Detail Navigation (Appointments) - 5 | Eye icon shows appointment details          |
| Status Badges (Appointments) - 6     | Color-coded status indicators               |

## Appointment Detail Tests

| **Runs**                              | **Expected Results**          |
| ------------------------------------------- | ----------------------------------- |
| Detail Loading (Appointment Detail) - 1     | Shows complete booking information  |
| User Panel (Appointment Detail) - 2         | Displays requestor details          |
| Professional Panel (Appointment Detail) - 3 | Shows provider credentials          |
| Status Update (Appointment Detail) - 4      | Dropdown updates appointment status |

## Posts Management Tests

| **Runs**                | **Expected Results**              |
| ----------------------------- | --------------------------------------- |
| Posts List (Posts) - 1        | Shows table with user-generated content |
| Search Function (Posts) - 2   | Filters by content, author name         |
| Content Preview (Posts) - 3   | Truncated post text display             |
| Author Display (Posts) - 4    | Shows profile, Pro badge                |
| Detail Navigation (Posts) - 5 | Eye icon shows full post                |
| Delete Action (Posts) - 6     | Trash icon with confirmation            |

## Post Detail Tests

| **Runs**                     | **Expected Results**        |
| ---------------------------------- | --------------------------------- |
| Detail Loading (Post Detail) - 1   | Shows complete post and media     |
| Content Display (Post Detail) - 2  | Full post text without truncation |
| Author Panel (Post Detail) - 3     | Detailed author information       |
| Moderation Panel (Post Detail) - 4 | Admin actions: edit, delete       |

## Reported Posts Management Tests

| **Runs**                         | **Expected Results**             |
| -------------------------------------- | -------------------------------------- |
| Reported List (Reported Posts) - 1     | Shows content moderation queue         |
| Search Function (Reported Posts) - 2   | Filters by content, author, reason     |
| Reason Filter (Reported Posts) - 3     | Filters by violation categories        |
| Status Filter (Reported Posts) - 4     | Filters by Pending, Dismissed, Removed |
| Detail Navigation (Reported Posts) - 5 | Eye icon shows report details          |
| Quick Dismiss (Reported Posts) - 6     | Checkmark dismisses report             |
| Quick Remove (Reported Posts) - 7      | Trash removes violating post           |
| Status Badges (Reported Posts) - 8     | Color-coded report status              |

## Reported Post Detail Tests

| **Runs**                         | **Expected Results**        |
| -------------------------------------- | --------------------------------- |
| Detail Loading (Report Detail) - 1     | Shows complete reported content   |
| Context Panel (Report Detail) - 2      | Displays reporter info, reason    |
| Resolution Actions (Report Detail) - 3 | Dismiss, remove, escalate options |
| Admin Notes (Report Detail) - 4        | Text area for decision notes      |

## Admin Codes Management Tests

| **Runs**                     | **Expected Results**                |
| ---------------------------------- | ----------------------------------------- |
| Codes List (Admin Codes) - 1       | Shows table with generated codes          |
| Generate Button (Admin Codes) - 2  | Opens code creation modal                 |
| Time Selection (Admin Codes) - 3   | Dropdown for expiration times             |
| Code Generation (Admin Codes) - 4  | Creates 8-character code                  |
| Copy Function (Admin Codes) - 5    | Copies code to clipboard                  |
| Status Badges (Admin Codes) - 6    | Shows Active, Used, Expired               |
| Usage Tracking (Admin Codes) - 7   | Displays when code was used               |
| Delete Action (Admin Codes) - 8    | Trash icon deletes code with confirmation |
| Cleanup Function (Admin Codes) - 9 | Removes all expired codes                 |
