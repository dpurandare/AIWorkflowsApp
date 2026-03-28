# AI Workflows App

A web application that provides a clean, role-controlled interface to the **Jade Business Services n8n workflow automation platform** (`https://n8n.jade-biz.com`). Users can run AI-powered research and presentation generation workflows through web forms, with results displayed inline.

---

## Features

- **User authentication** — JWT-based login with 8-hour session tokens
- **Role-Based Access Control (RBAC)** — admins have full access; regular users are granted access to specific workflows by an admin
- **7 AI workflows** across three categories (see below)
- **Markdown result rendering** — research workflow output is rendered as formatted markdown
- **Presentation download** — presentation workflows display a prominent download/view card when the deck is ready
- **Change password** — any logged-in user can update their own password
- **User management** — admins can create, enable/disable, and delete users, and manage per-user workflow permissions

---

## Workflow Catalogue

### Person Research
| Workflow | Description |
|---|---|
| Person Search Report Generator | Searches for information on a person using OpenAI, Gemini, and SerpAPI |
| Person Information Enrichment (Apollo.ai) | Enriches person data via Apollo.ai; requires First Name and Last Name |

### Company Research
| Workflow | Description |
|---|---|
| Company Researcher | Researcher/reviewer pattern using OpenAI, Gemini, and SerpAPI |
| Company Information Search Agent | Parallel Gemini agents merged by a third agent |

### Presentation Generation
| Workflow | Description |
|---|---|
| Presentation Creator | Generates a deck via Gamma AI; returns download and view URLs |
| Tailored Presentation | Same as above but tailored to a specific target company and person |
| Custom Services Presentation | Analyses target against our services catalogue and produces content skeleton |

---

## Project Structure

```
AIWorkflowsApp/
├── reference                        # n8n API reference document
├── backend/                         # FastAPI + SQLite
│   ├── main.py                      # App factory, CORS, startup seed
│   ├── auth.py                      # JWT creation/verification, bcrypt hashing
│   ├── database.py                  # SQLAlchemy engine and session
│   ├── models.py                    # User, WorkflowPermission ORM models
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── dependencies.py              # get_current_user, get_admin_user FastAPI deps
│   ├── utils.py                     # Shared helpers
│   ├── workflows.py                 # Registry of all 7 n8n workflows
│   ├── requirements.txt
│   ├── .env.example
│   └── routers/
│       ├── auth_router.py           # POST /api/auth/login, GET /api/auth/me,
│       │                            # POST /api/auth/change-password
│       ├── workflows_router.py      # GET /api/workflows,
│       │                            # POST /api/workflows/{id}/execute
│       └── admin_router.py          # User CRUD + permissions management
└── frontend/                        # React + TypeScript + Vite + Tailwind CSS
    └── src/
        ├── App.tsx                  # Routes
        ├── workflows.ts             # Frontend workflow field definitions
        ├── api/client.ts            # Axios instance with JWT interceptor
        ├── contexts/AuthContext.tsx # Auth state, login/logout
        ├── components/
        │   ├── Layout.tsx           # Nav bar with Change password + Sign out
        │   ├── ProtectedRoute.tsx   # Redirect to /login if unauthenticated
        │   └── MarkdownResult.tsx   # Result renderer (markdown + download card)
        └── pages/
            ├── Login.tsx
            ├── Dashboard.tsx        # Workflow cards grouped by category
            ├── ChangePassword.tsx
            ├── WorkflowPage.tsx     # Dynamic form + result (shared by all workflows)
            ├── workflows/           # One thin wrapper component per workflow
            │   ├── PersonResearcher.tsx
            │   ├── PersonEnrichmentApollo.tsx
            │   ├── CompanyResearcher.tsx
            │   ├── CompanySearchAgent.tsx
            │   ├── PresentationCreator.tsx
            │   ├── TailoredPresentation.tsx
            │   └── CustomServicesPresentation.tsx
            └── admin/
                └── UserManagement.tsx  # Create/disable/delete users, set permissions
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) create a .env file from the example and set a strong SECRET_KEY
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

On first start, a default admin account is created:

| Username | Password |
|---|---|
| `admin` | `admin123` |

> **Change this password immediately** after first login.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (proxies /api → localhost:8000)
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production build

```bash
cd frontend && npm run build
```

The compiled output lands in `frontend/dist/`. The FastAPI backend automatically serves it when that directory exists — a single `uvicorn main:app` process serves both the API and the frontend.

---

## API Reference

All endpoints require a `Bearer` token in the `Authorization` header (obtained from `POST /api/auth/login`) except the login endpoint itself.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Returns a JWT access token |
| `GET` | `/api/auth/me` | User | Returns the current user's profile and permissions |
| `POST` | `/api/auth/change-password` | User | Changes the current user's password |
| `GET` | `/api/workflows` | User | Lists workflows accessible to the current user |
| `POST` | `/api/workflows/{id}/execute` | User | Executes a workflow (proxies to n8n, 300 s timeout) |
| `GET` | `/api/admin/users` | Admin | Lists all users |
| `POST` | `/api/admin/users` | Admin | Creates a new user |
| `PUT` | `/api/admin/users/{id}` | Admin | Updates a user (password, role, active status) |
| `DELETE` | `/api/admin/users/{id}` | Admin | Deletes a user |
| `GET` | `/api/admin/users/{id}/permissions` | Admin | Gets a user's workflow permissions |
| `PUT` | `/api/admin/users/{id}/permissions` | Admin | Sets a user's workflow permissions |
| `GET` | `/api/admin/workflows` | Admin | Lists all available workflows |

---

## RBAC Model

- **Admin** — full access to all 7 workflows and the User Management panel
- **User** — access only to workflows explicitly assigned by an admin

Enforcement is at two layers:
1. **Backend** — every `/api/workflows/{id}/execute` call is checked against the user's permission rows before the n8n proxy request is made
2. **Frontend** — `WorkflowPage` checks the user's permission list from `AuthContext` and shows an *Access Denied* screen before rendering the form for an unassigned workflow
