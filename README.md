# mycontacts-backend

Small Express + Mongoose REST API for managing personal contacts.

**Goal:** Provide a private contacts API where authenticated users can create, read, update and delete only their own contacts.

**Quick Setup**

- Install dependencies:

```bash
npm install
```

- Create a `.env` file at the project root with:

```
CONNECTION_STRING=<your-mongo-uri-including-db-name>
PORT=5001
JWT_SECRET=<your_jwt_secret>
```

Example Atlas URI:

```
mongodb+srv://admin:YourPassword@clustername.ltrwwj2.mongodb.net/mycontacts-backend?retryWrites=true&w=majority
```

**Run**

```bash
node server.js
# or with nodemon
npx nodemon server.js
```

**Project Layout**

- `server.js` — bootstrap (dotenv, DB connect, middleware, routes)
- `config/dbConnection.js` — mongoose connection wrapper
- `controllers/` — request handlers for users and contacts
- `models/` — Mongoose schemas
- `routes/` — Express routers
- `middleware/` — `validateTokenHandler.js`, `errorHandler.js`

**How it works (high level)**

1. `server.js` loads `dotenv`, connects to MongoDB and mounts middleware and routes.
2. Auth routes issue JWTs; `validateTokenHandler` verifies tokens and attaches `req.user`.
3. `contactRoutes` are protected and controllers enforce ownership before returning or modifying data.

**What we tried to achieve — JWT, authentication, and logic**

- Issue JSON Web Tokens (JWT) when users register or log in so clients can authenticate without storing credentials on the server.
- Keep routes private by attaching the `validateTokenHandler` middleware to routers that require authentication. This middleware:
	- reads the token from the `Authorization: Bearer <token>` header,
	- verifies the token using `JWT_SECRET`, and
	- attaches the authenticated user payload to `req.user` for downstream handlers.
- Enforce resource ownership in controllers: after `validateTokenHandler` sets `req.user`, controllers check that `contact.user_id.toString() === req.user._id.toString()` before returning, updating, or deleting a contact. If the IDs don't match, return `403 Forbidden`.
- Keep secrets out of source control by using `.env` for `CONNECTION_STRING` and `JWT_SECRET` and calling `require('dotenv').config()` before any DB or auth logic runs.
- Error handling and clear HTTP statuses: controllers set appropriate status codes (`201`, `200`, `404`, `403`, `500`) and throw errors handled centrally by `errorHandler.js`.

These pieces together provide stateless authentication (JWT) and per-resource authorization (ownership checks) so each user can only manage their own contacts while the server remains simple and horizontally scalable.

**Common issues & fixes**

- `MODULE_NOT_FOUND` — check require paths and filenames (singular/plural mismatches matter).
- `dotenv` values undefined — call `require('dotenv').config()` before using `process.env`.
- `querySrv ECONNREFUSED` — SRV DNS lookup failed; check Atlas network whitelist, switch DNS (e.g. 8.8.8.8), or use the non-SRV `mongodb://` form Atlas provides.
- `router.use TypeError` — ensure middleware exports are functions and you call `router.use(validateToken)` not `router.use(validateToken())`.

**Lessons learned**

- Keep filenames and require paths consistent.
- Load environment variables before connecting to DB.
- Protect routes with middleware and also verify resource ownership in controllers.
- Have a fallback for SRV DNS issues when connecting to Atlas.

**Next steps / Improvements**

- Add request validation (Joi or express-validator).
- Add unit/integration tests for routes and middleware.
- Add CI to prevent committing `.env` and enforce linting.

---


# Rest-API
Provide a private contacts API where authenticated users can create, read, update and delete only their own contacts.
