# 🗺️ Database Manager - Visual Feature Map

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURE DATABASE INTERFACE                    │
│                      P & A Laboratory System                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐   ┌──────────┐   ┌──────────┐
         │  Header  │   │  Sidebar │   │  Security│
         │ (Title + │   │  (Menu)  │   │Indicator │
         │ Security)│   │          │   │(🔒 Badge)│
         └──────────┘   └──────────┘   └──────────┘
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    ┌────────────────────────┐
    │  QUICK STATS DASHBOARD │
    │  (6 Stat Cards)        │
    │  • Patients (🔒)       │
    │  • Tests (🔒)          │
    │  • Results (🔒)        │
    │  • Inventory (🔓)      │
    │  • Transactions (🔒)   │
    │  • Audit Logs (🛡️)    │
    └────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    ┌─────────────────────────────────────┐
    │         TABBED INTERFACE            │
    ├─────────────────────────────────────┤
    │ ┌──────┬──────┬──────┬──────────┐   │
    │ │Pats. │Tests │Rslt. │Invent.  │... │
    │ └──────┴──────┴──────┴──────────┘   │
    │                                      │
    │  ┌──────────────────────────────┐   │
    │  │  CONTROLS BAR                │   │
    │  │ [Search] [Filter] [Actions]  │   │
    │  └──────────────────────────────┘   │
    │                                      │
    │  ┌──────────────────────────────┐   │
    │  │  DATA TABLE                  │   │
    │  │  ID | Name | Status | Action│   │
    │  │  ── | ──── | ────── | ──────│   │
    │  │  #1 | John | Active | View  │   │
    │  │  #2 | Jane | Active | View  │   │
    │  └──────────────────────────────┘   │
    └─────────────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    ┌────────────────┐  ┌─────────────────┐
    │  DATA INTEGRITY│  │  AUDIT TRAIL    │
    │  PANEL         │  │  (Dedicated Tab)│
    │ [Backup]       │  │ Timestamp|User  │
    │ [Verify]       │  │ Action|Details  │
    └────────────────┘  └─────────────────┘
```

---

## 📊 Tab Structure & Data Flow

```
PATIENTS TAB
├── Search: By name, ID, contact
├── Filter: Active / Inactive
├── Table Columns:
│   ├── ID (🔒 Locked)
│   ├── Name
│   ├── Date of Birth
│   ├── Gender
│   ├── Contact
│   ├── Address
│   ├── Status (Badge)
│   └── Actions (View, Edit)
├── Quick Actions:
│   └── [+ Add Patient] Button
└── Audit Logging:
    ├── READ (when tab opened)
    ├── SEARCH (when searching)
    ├── CREATE (when adding)
    └── VIEW (when viewing details)

TEST REQUESTS TAB
├── Search: By patient, test type
├── Filter: Pending / In Progress / Completed
├── Table Columns:
│   ├── ID (🔒 Locked)
│   ├── Patient Name
│   ├── Test Type
│   ├── Requested Date
│   ├── Status (Badge: 🟡 🔵 🟢)
│   ├── Priority (Badge: 🔴 🟠)
│   └── Actions (View)
└── Audit Logging: READ / SEARCH / VIEW

LAB RESULTS TAB
├── Search: By patient, test type
├── Filter: Normal / Abnormal / Critical
├── Table Columns:
│   ├── ID (🔒 Locked)
│   ├── Patient Name
│   ├── Test Type
│   ├── Result Status (Badge: 🟢 🟡 🔴)
│   ├── Date Completed
│   ├── Reviewed By
│   └── Actions (View, Download)
└── Audit Logging: READ / EXPORT / VIEW

INVENTORY TAB
├── Search: By item name, category
├── Filter: In Stock / Low Stock / Out of Stock
├── Table Columns:
│   ├── Item ID
│   ├── Item Name
│   ├── Category
│   ├── Current Stock
│   ├── Unit
│   ├── Status (Badge)
│   ├── Last Updated
│   └── Actions (View, Edit)
├── Quick Actions:
│   └── [+ Add Item] Button
└── Audit Logging: READ / CREATE / UPDATE

TRANSACTIONS TAB
├── Search: By transaction ID, item
├── Filter: Service / Supply / Refund
├── Table Columns:
│   ├── ID (🔒 Locked)
│   ├── Date
│   ├── Item/Service
│   ├── Type
│   ├── Amount (₱ formatted)
│   ├── Status (Badge)
│   ├── Reference
│   └── Actions (View)
└── Audit Logging: READ / SEARCH / VIEW

AUDIT TRAIL TAB
├── Search: By user, action, record
├── Filter: CREATE / READ / UPDATE / DELETE / EXPORT
├── Table Columns:
│   ├── Timestamp (ISO format)
│   ├── User
│   ├── Action (Badge)
│   ├── Record Type
│   ├── Record ID (🔒)
│   ├── Details
│   ├── IP Address (Monospace)
│   └── Status (Badge: ✓ ✗)
├── Quick Actions:
│   └── [📥 Export Log] Button
└── Complete History:
    └── All actions from all users
```

---

## 🔐 Security & Access Control Flow

```
USER ACCESSES PAGE
│
├─→ SIDEBAR NAVIGATION
│   └─→ Database Manager Link
│
├─→ PAGE LOADS
│   ├─→ Security Indicator: 🔒 Encrypted
│   ├─→ Quick Stats: All counts displayed
│   └─→ Default Tab: Patients (Active)
│
├─→ USER VIEWS DATA
│   ├─→ AUDIT LOG ENTRY CREATED
│   │   ├─ Timestamp: ISO format
│   │   ├─ User: Current user
│   │   ├─ Action: READ/VIEW
│   │   ├─ Record Type: PATIENTS
│   │   ├─ Record ID: * (all)
│   │   └─ Status: Success ✓
│   │
│   └─→ SECURITY INDICATORS
│       ├─ Lock Icon: 🔒
│       ├─ Access Level: Restricted
│       └─ Color Badge: Orange
│
├─→ USER SEARCHES
│   ├─→ Real-time filtering
│   ├─→ AUDIT LOG ENTRY (optional)
│   │   ├─ Action: SEARCH
│   │   └─ Details: Query performed
│   │
│   └─→ Results update instantly
│
├─→ USER FILTERS
│   ├─→ Combined with search
│   ├─→ AUDIT LOG ENTRY (optional)
│   │   ├─ Action: FILTER
│   │   └─ Details: Filter applied
│   │
│   └─→ Results update
│
├─→ USER ADDS RECORD
│   ├─→ Click [+ Add]
│   ├─→ Modal opens
│   ├─→ Fill form
│   ├─→ Submit
│   │
│   ├─→ AUDIT LOG ENTRY
│   │   ├─ Action: CREATE
│   │   ├─ Record Type: PATIENTS
│   │   ├─ Record ID: P_NEW
│   │   ├─ Details: New patient added
│   │   └─ Status: Success ✓
│   │
│   └─→ Table reloads with new entry
│
├─→ USER EXPORTS DATA
│   ├─→ Click [Export Log]
│   ├─→ CSV downloads
│   │
│   ├─→ AUDIT LOG ENTRY
│   │   ├─ Action: EXPORT
│   │   ├─ Record Type: AUDIT
│   │   ├─ Record ID: *
│   │   ├─ Details: Exported as CSV
│   │   └─ Status: Success ✓
│   │
│   └─→ File saved to device
│
├─→ USER BACKS UP DATA
│   ├─→ Click [Backup Now]
│   │
│   ├─→ AUDIT LOG ENTRY
│   │   ├─ Action: BACKUP
│   │   ├─ Record Type: DATABASE
│   │   ├─ Details: Initiated backup
│   │   └─ Status: Success ✓
│   │
│   └─→ Timestamp displays
│
└─→ USER VERIFIES DATA
    ├─→ Click [Run Check]
    │
    ├─→ AUDIT LOG ENTRY
    │   ├─ Action: VERIFY
    │   ├─ Record Type: DATABASE
    │   ├─ Details: Integrity check
    │   └─ Status: Success ✓
    │
    └─→ Confirmation message
```

---

## 🎨 UI Component Hierarchy

```
DATABASE_MANAGER
│
├── SIDEBAR
│   ├── Logo Row
│   ├── Navigation Items
│   │   ├── Dashboard
│   │   ├── Database Manager (Active)
│   │   ├── Patient Tests
│   │   ├── Lab Results
│   │   ├── Inventory
│   │   ├── Transactions
│   │   ├── User Management
│   │   └── Activity Logs
│   └── Logout Button
│
├── MAIN CONTENT
│   │
│   ├── HEADER (Topbar)
│   │   ├── Title: "Centralized Records Interface"
│   │   ├── Eyebrow: "Database Management"
│   │   └── Security Indicator: 🔒 Encrypted
│   │
│   ├── CONTAINER
│   │   │
│   │   ├── QUICK STATS SECTION
│   │   │   ├── Stat Card: Patients
│   │   │   │   ├── Icon: 👥
│   │   │   │   ├── Title: Total Patients
│   │   │   │   ├── Count: 42
│   │   │   │   ├── Lock Icon: 🔒
│   │   │   │   └── Meta: Active records
│   │   │   ├── Stat Card: Tests
│   │   │   ├── Stat Card: Results
│   │   │   ├── Stat Card: Inventory
│   │   │   ├── Stat Card: Transactions
│   │   │   └── Stat Card: Audit Logs
│   │   │
│   │   ├── TABS WRAPPER
│   │   │   │
│   │   │   ├── TABS HEADER
│   │   │   │   ├── Tab Button: Patients (Active)
│   │   │   │   ├── Tab Button: Tests
│   │   │   │   ├── Tab Button: Results
│   │   │   │   ├── Tab Button: Inventory
│   │   │   │   ├── Tab Button: Transactions
│   │   │   │   └── Tab Button: Audit Trail
│   │   │   │
│   │   │   ├── TAB CONTENT: Patients
│   │   │   │   ├── Section Header
│   │   │   │   │   ├── Title: Patient Records
│   │   │   │   │   └── Meta: 🔒 Restricted Access
│   │   │   │   │
│   │   │   │   ├── Controls Bar
│   │   │   │   │   ├── Search Group
│   │   │   │   │   │   └── Search Input
│   │   │   │   │   ├── Filter Group
│   │   │   │   │   │   └── Filter Select
│   │   │   │   │   └── Action Button
│   │   │   │   │       └── [+ Add Patient]
│   │   │   │   │
│   │   │   │   └── Table
│   │   │   │       ├── Headers
│   │   │   │       │   ├── ID (🔒)
│   │   │   │       │   ├── Name
│   │   │   │       │   ├── DOB
│   │   │   │       │   ├── Gender
│   │   │   │       │   ├── Contact
│   │   │   │       │   ├── Address
│   │   │   │       │   ├── Status
│   │   │   │       │   └── Actions
│   │   │   │       │
│   │   │   │       └── Rows (with hover effects)
│   │   │   │           └── Each row has action buttons
│   │   │   │
│   │   │   ├── TAB CONTENT: Tests (Similar structure)
│   │   │   ├── TAB CONTENT: Results (Similar structure)
│   │   │   ├── TAB CONTENT: Inventory (Similar structure)
│   │   │   ├── TAB CONTENT: Transactions (Similar structure)
│   │   │   │
│   │   │   └── TAB CONTENT: Audit Trail
│   │   │       ├── Full history of all actions
│   │   │       ├── Search by user/action
│   │   │       ├── Filter by action type
│   │   │       └── Export capability
│   │   │
│   │   └── DATA INTEGRITY PANEL
│   │       ├── Title: Data Protection & Integrity
│   │       │
│   │       ├── Integrity Card: Backup Status
│   │       │   ├── Icon: 💾
│   │       │   ├── Title: Backup Status
│   │       │   ├── Value: Last: [Timestamp]
│   │       │   └── Button: [Backup Now]
│   │       │
│   │       ├── Integrity Card: Encryption
│   │       │   ├── Icon: 🔒
│   │       │   ├── Title: Encryption Status
│   │       │   ├── Value: Active
│   │       │   └── Meta: All data encrypted
│   │       │
│   │       ├── Integrity Card: Verification
│   │       │   ├── Icon: ✓
│   │       │   ├── Title: Data Verification
│   │       │   ├── Value: All verified
│   │       │   └── Button: [Run Check]
│   │       │
│   │       └── Integrity Card: Access Control
│   │           ├── Icon: 🔑
│   │           ├── Title: Access Control
│   │           ├── Value: Role-Based
│   │           └── Meta: Admin access only
│   │
│   └── MODALS
│       │
│       ├── MODAL: Add Patient
│       │   ├── Header
│       │   │   ├── Title: Add New Patient
│       │   │   └── Close Button
│       │   │
│       │   └── Form
│       │       ├── Input: Full Name *
│       │       ├── Select: Gender *
│       │       ├── Input: Date of Birth *
│       │       ├── Input: Contact *
│       │       ├── Textarea: Address
│       │       │
│       │       └── Actions
│       │           ├── [Cancel]
│       │           └── [Add Patient]
│       │
│       └── MODAL: Add Inventory
│           ├── Header
│           │   ├── Title: Add Inventory Item
│           │   └── Close Button
│           │
│           └── Form
│               ├── Input: Item Name *
│               ├── Select: Category *
│               ├── Input: Stock *
│               ├── Input: Unit *
│               ├── Select: Status
│               │
│               └── Actions
│                   ├── [Cancel]
│                   └── [Add Item]
```

---

## 🔄 Data Flow Example: Patient Search

```
USER TYPES IN SEARCH BOX
│
├─→ Input Event Triggered
│   └─→ 'input' event listener fires
│
├─→ filterPatients() Called
│   ├─→ Get search value: "John"
│   ├─→ Get filter value: "active"
│   │
│   └─→ Loop through table rows
│       ├─→ Row 1: "John Doe | Active"
│       │   ├─ Search matches: ✓ (contains "John")
│       │   ├─ Filter matches: ✓ (status is "active")
│       │   └─ Result: Display row
│       │
│       ├─→ Row 2: "Jane Smith | Active"
│       │   ├─ Search matches: ✗ (doesn't contain "John")
│       │   ├─ Filter matches: ✓
│       │   └─ Result: Hide row
│       │
│       └─→ Row 3: "John Brown | Inactive"
│           ├─ Search matches: ✓ (contains "John")
│           ├─ Filter matches: ✗ (status is "inactive")
│           └─ Result: Hide row
│
├─→ showEmptyState() Called
│   └─→ If all rows hidden: Show "No results" message
│       Else: Keep table rows visible
│
└─→ USER SEES RESULTS
    └─→ Only matching rows displayed
```

---

## 🛡️ Audit Trail Log Entries

```
Every action generates a log entry:

┌─────────────────────────────────────────────────────────┐
│ TIMESTAMP: 2024-11-27T14:35:22.123Z                     │
│ USER: admin                                             │
│ ACTION: READ                                            │
│ RECORD_TYPE: PATIENTS                                  │
│ RECORD_ID: *                                            │
│ DETAILS: Retrieved patient records list                 │
│ IP_ADDRESS: 192.168.1.100                              │
│ STATUS: success                                         │
└─────────────────────────────────────────────────────────┘

Stored in: localStorage['auditLog']
Format: JSON array of entries
Accessible from: Audit Trail tab
Exported as: CSV file
Searchable: Yes (real-time)
Filterable: Yes (by action type)
```

---

## 📱 Responsive Breakpoints

```
DESKTOP (1024px+)
├── Sidebar: Full width (250px)
├── Main: Calc(100% - 250px)
├── Stats Grid: 3 columns
├── Tabs: Horizontal
├── Table: Full display
└── Overall: Optimal viewing

TABLET (768px - 1023px)
├── Sidebar: Full width (250px)
├── Main: Calc(100% - 250px)
├── Stats Grid: 2 columns
├── Tabs: Horizontal with scroll
├── Table: Horizontal scroll
└── Modals: Adjusted width

MOBILE (480px - 767px)
├── Sidebar: Collapsed (72px)
├── Main: Calc(100% - 72px)
├── Stats Grid: 1 column
├── Tabs: Stack vertically
├── Table: Horizontal scroll
└── Buttons: Full width

SMALL MOBILE (<480px)
├── Sidebar: Collapsed or hidden
├── Main: Full width
├── Stats Grid: Stack all
├── Controls: Stack vertically
├── Buttons: Larger touch targets
└── Modals: Full screen
```

---

## 🎯 User Interaction Map

```
LANDING ON PAGE
│
├─→ Quick Overview
│   ├─ See record counts
│   └─ Check stats
│
├─→ Browse Data
│   ├─ Click tabs
│   └─ View tables
│
├─→ Find Specific Records
│   ├─ Type search keywords
│   ├─ Apply filters
│   └─ Click actions
│
├─→ Manage Records
│   ├─ Add new records
│   ├─ View details
│   └─ Edit/delete items
│
├─→ Export Data
│   ├─ Download reports
│   └─ Share findings
│
├─→ Monitor System
│   ├─ Check audit trail
│   ├─ Review access logs
│   └─ Verify integrity
│
└─→ Maintain Data
    ├─ Backup database
    ├─ Verify records
    └─ Log off
```

---

This feature map provides a comprehensive visual guide to the entire database interface system!

**Last Updated:** November 27, 2024
