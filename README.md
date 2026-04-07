# AI Workflows App

A web application that provides a clean, role-controlled interface to the **Jade Business Services n8n workflow automation platform**. Users can run AI-powered research and presentation generation workflows through web forms, with results displayed inline.

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

# (Optional) override where runtime data is stored
# Default standalone location: backend/data
# APP_DATA_DIR=./data

# Choose which n8n server to target
# N8N_BASE_URL=https://n8n.jade-biz.com
# or
# N8N_BASE_URL=https://n8n-2.jade-biz.com

# Start the server
uvicorn main:app --reload --port 8000
```

The backend reads `N8N_BASE_URL` from `backend/.env` and uses it for all workflow webhook calls.
Runtime data is stored under `APP_DATA_DIR`. By default, the standalone app uses `backend/data/app.db`.

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

### Docker

The project root includes a `Dockerfile` that builds the frontend and serves the frontend and backend together from a single container.

The container uses `/data` as its application data directory. Mount a named Docker volume there so the SQLite database and optional persisted settings survive container replacement.

Build the image from the project root:

```bash
docker build -t ai-workflows-app .
```

Run the container in the foreground:

```bash
docker volume create ai-workflows-data

docker run --rm -p 8000:8000 \
    -v ai-workflows-data:/data \
    -e SECRET_KEY=replace-with-a-strong-secret \
    -e N8N_BASE_URL=https://n8n-2.jade-biz.com \
    -e WORKFLOW_VERIFY_SSL=false \
    ai-workflows-app
```

Then open `http://localhost:8000`.

If port `8000` is already in use on your machine, map the container to a different host port, for example `8080`:

```bash
docker run --rm -p 8080:8000 \
    -v ai-workflows-data:/data \
    -e SECRET_KEY=replace-with-a-strong-secret \
    -e N8N_BASE_URL=https://n8n-2.jade-biz.com \
    -e WORKFLOW_VERIFY_SSL=false \
    ai-workflows-app
```

Then open `http://localhost:8080`.

To run the container in detached mode:

```bash
docker run -d --name ai-workflows-app-container -p 8080:8000 \
    -v ai-workflows-data:/data \
    -e SECRET_KEY=replace-with-a-strong-secret \
    -e N8N_BASE_URL=https://n8n-2.jade-biz.com \
    -e WORKFLOW_VERIFY_SSL=false \
    ai-workflows-app
```

Useful container commands:

```bash
docker logs -f ai-workflows-app-container
docker stop ai-workflows-app-container
docker rm ai-workflows-app-container
```

You can also run the app with Docker Compose. Create a root-level `.env` file or export the variables in your shell first:

```bash
SECRET_KEY=replace-with-a-strong-secret
N8N_BASE_URL=https://n8n-2.jade-biz.com
WORKFLOW_VERIFY_SSL=false
```

Then start the stack:

```bash
docker compose up --build -d
```

The compose setup publishes the app at `http://localhost:8080` and persists application data in the named Docker volume `ai-workflows-data`.

Useful Compose commands:

```bash
docker compose logs -f
docker compose down
docker compose down -v
```

Notes:

- The container serves the built frontend and backend from a single process on port `8000`.
- The SQLite database is stored at `/data/app.db` in Docker and `backend/data/app.db` in standalone mode.
- You can persist additional file-based settings in `APP_DATA_DIR/settings.env`. Real environment variables still take precedence over values in that file.
- If the target n8n server uses a trusted certificate chain, set `WORKFLOW_VERIFY_SSL=true`.

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
