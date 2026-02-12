## Task Management Backend & Frontend

This project is a **Node.js + Express + PostgreSQL** backend with a **React (Vite) frontend** for a simple, production-ready task management system. It includes:

- User registration and login with JWT authentication
- Role-based access control (`user` and `admin`)
- Task CRUD APIs with ownership rules and pagination
- PostgreSQL persistence
- React frontend for auth and task management

---

### Tech stack

- **Backend**
  - Node.js, Express
  - PostgreSQL (`pg` + connection pooling)
  - JWT authentication (`jsonwebtoken`)
  - Password hashing (`bcrypt`)
  - Environment management (`dotenv`)
  - CORS configuration (`cors`)
- **Frontend**
  - React (Vite)
  - React Router
  - Axios
- **Tooling**
  - Nodemon for local backend development
  - Postman collection for API documentation and testing

---

### Project structure

Backend (`backend/`):

- `app.js` – Express app, middleware, routing, CORS
- `server.js` – server bootstrap, DB check + table initialization
- `config/`
  - `env.js` – loads `.env`, exposes configuration values
  - `db.js` – PostgreSQL pool, connection test, table initialization (`users`, `tasks`)
- `controllers/`
  - `authController.js` – register/login logic
  - `healthController.js` – health check
  - `taskController.js` – task CRUD with RBAC and pagination
- `middleware/`
  - `authMiddleware.js` – JWT verification, attaches `req.user`
  - `roleMiddleware.js` – role-based guard (e.g. admin only)
  - `errorHandler.js` – global error handler
  - `notFound.js` – 404 handler
- `routes/`
  - `healthRoutes.js` – `/api/v1/health`
  - `authRoutes.js` – `/api/v1/auth/*`
  - `taskRoutes.js` – `/api/v1/tasks/*`
  - `index.js` – central router mounted at `/api/v1`
- `utils/`
  - `apiResponse.js` – consistent JSON response helper
- `docs/`
  - `postman_collection.json` – Postman collection documenting all Auth and Task APIs

Frontend (`backend/frontend/` – created with Vite React template):

- `src/main.jsx` – React root
- `src/App.jsx` – routes and layout
- `src/api/client.js` – Axios instance with base URL + JWT header
- `src/context/AuthContext.jsx` – auth state, token + user in `localStorage`
- `src/components/ProtectedRoute.jsx` – protects private routes
- `src/pages/`
  - `RegisterPage.jsx` – user registration
  - `LoginPage.jsx` – login page
  - `DashboardPage.jsx` – simple dashboard for logged-in user
  - `TasksPage.jsx` – tasks listing, creation, pagination, status toggle

---

### Environment variables

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/intern_project
JWT_SECRET=some_super_secret_key_here
```

> Adjust `DATABASE_URL` and `PORT` as needed for your environment.

---

### Database schema

**users**

- `id` – `UUID PRIMARY KEY`
- `name` – `VARCHAR NOT NULL`
- `email` – `VARCHAR UNIQUE NOT NULL`
- `password` – `VARCHAR NOT NULL` (bcrypt hash)
- `role` – `VARCHAR CHECK (role IN ('user','admin')) DEFAULT 'user'`
- `created_at` – `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

**tasks**

- `id` – `UUID PRIMARY KEY`
- `title` – `VARCHAR NOT NULL`
- `description` – `TEXT`
- `status` – `VARCHAR CHECK (status IN ('pending','completed')) DEFAULT 'pending'`
- `user_id` – `UUID REFERENCES users(id)`
- `created_at` – `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

> The backend automatically creates `users` and `tasks` tables on startup (assuming the DB and required extensions like `pgcrypto` are available).

---

### Backend setup & run

From the `backend/` folder:

```bash
npm install
npm start
```

The backend will:

- Load environment variables from `.env`
- Connect to PostgreSQL and verify connectivity
- Initialize `users` and `tasks` tables if they do not exist
- Start Express on `http://localhost:3001` (or the configured `PORT`)

Health check:

```text
GET http://localhost:3001/api/v1/health
```

---

### Frontend setup & run

From `backend/frontend/`:

```bash
npm install
npm run dev
```

Open the printed Vite URL (typically `http://localhost:5173`) in your browser.

Pages:

- `/register` – create a user (`user` or `admin`)
- `/login` – authenticate and store JWT in `localStorage`
- `/dashboard` – protected dashboard showing current user info
- `/tasks` – protected task management page (list, create, update status)

---

### API overview (using Postman instead of Swagger)

API documentation is provided via a **Postman collection**, not Swagger.

- Import the collection file:
  - Open **Postman**
  - Click **Import**
  - Select `backend/docs/postman_collection.json`

Once imported, you’ll see two folders: **Auth** and **Tasks**, each with ready-made requests.

#### Auth APIs

- `POST /api/v1/auth/register`
  - Body: `{ "name", "email", "password", "role" }`
  - Registers a new user; `role` is `user` or `admin` (default `user`).
- `POST /api/v1/auth/login`
  - Body: `{ "email", "password" }`
  - Returns `{ token, user }` on success.

#### Task APIs (JWT-protected)

All task requests require:

- Header: `Authorization: Bearer <JWT_TOKEN>`

Endpoints:

- `POST /api/v1/tasks`
  - Create task for the authenticated user.
- `GET /api/v1/tasks?page=1&limit=10`
  - Paginated tasks.
  - Normal users: only their tasks.
  - Admin: all tasks.
- `GET /api/v1/tasks/:id`
  - Fetch single task; users can only access their own; admin can access any.
- `PUT /api/v1/tasks/:id`
  - Update `title`, `description`, or `status`.
  - Same ownership rules as above.
- `DELETE /api/v1/tasks/:id`
  - **Admin only** (enforced via `roleMiddleware('admin')`).

All responses use a consistent structure:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

---

### CORS configuration

`app.js` configures CORS to work seamlessly with the frontend in development:

- Allowed origins (development):
  - `http://localhost:5173` (Vite frontend)
  - `http://localhost:3000` (common React dev port)
- Methods: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- Headers: `Content-Type`, `Authorization`

In production, this can be tightened to specific domains instead of `*`.

---

### Scalability & architecture notes

This project is intentionally modular so it can grow into a production system. Key scalability considerations:

- **Horizontal scaling**
  - Run multiple backend instances (e.g., in containers or on multiple VMs).
  - Stateless design: sessions are JWT-based; no in-memory session storage, so instances can be scaled out behind a load balancer.
  - PostgreSQL connection pooling (via `pg.Pool`) helps share DB connections efficiently.

- **Load balancer**
  - Place a load balancer (e.g., Nginx, HAProxy, AWS ALB) in front of multiple backend instances.
  - Terminate TLS at the load balancer and forward traffic to Node instances on an internal network.
  - Configure health checks to hit `/api/v1/health`.

- **Redis caching**
  - Introduce Redis to cache frequently read data (e.g., user profiles, task lists for dashboards, authorization checks).
  - For read-heavy endpoints, use a cache-aside strategy:
    - Check Redis first
    - If missing, read from PostgreSQL, then populate cache with a TTL.
  - Redis can also be used for:
    - Rate limiting
    - Background job queues (e.g., via BullMQ) for heavy operations.

- **Microservices architecture**
  - As the system grows, split into domain-focused services:
    - **Auth service** – user management, JWT issuance/validation, roles & permissions.
    - **Task service** – task CRUD, workflows, notifications.
    - **API gateway** – central entry point that routes requests, handles auth, rate limiting, and aggregation.
  - Services communicate via HTTP or messaging (e.g., Kafka, RabbitMQ, or Redis streams).
  - Each service can scale independently based on traffic patterns.

- **Docker deployment**
  - Containerize the backend and frontend:
    - Backend Dockerfile: Node base image, install dependencies, copy source, expose port, run `node server.js`.
    - Frontend Dockerfile: build static assets with Vite, serve via lightweight web server (e.g., Nginx).
  - Use Docker Compose or Kubernetes:
    - Services:
      - `api` (Node backend)
      - `web` (React frontend)
      - `db` (PostgreSQL)
      - `redis` (optional cache)
    - Environment variables provided via `.env` or orchestrator secrets.

By combining these practices—stateless authentication, clean layering (controllers, middleware, routes, config), and container-friendly setup—the project is well-positioned to evolve into a scalable, production-grade microservice ecosystem.

