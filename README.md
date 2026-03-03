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
# Architecture Overview

This project follows the **MVC (Model-View-Controller) + Routes/Middleware** pattern, a standard layered architecture for Express REST APIs.

## Folder Structure

```
mycontacts-backend/
├── server.js                 # Entry point: bootstrap, dotenv, DB, middleware, routes
├── package.json
├── README.md
├── constants.js              # HTTP status constants
├── .env                      # Environment variables (secrets, not committed)
├── .gitignore
│
├── config/
│   └── dbConnection.js       # MongoDB/Mongoose connection wrapper
│
├── routes/
│   ├── contactRoutes.js      # Contact endpoints (GET, POST, PUT, DELETE /api/contacts)
│   └── userRoutes.js         # Auth endpoints (POST /api/users/register, /login)
│
├── controllers/
│   ├── contactControllers.js # Business logic: getAllContacts, getContactById, createContact, updateContact, deleteContact
│   └── userController.js     # Business logic: registerUser, loginUser, getCurrentUser
│
├── models/
│   ├── contactModel.js       # Mongoose schema & model for Contact collection
│   └── userModel.js          # Mongoose schema & model for User collection
│
└── middleware/
    ├── validateTokenHandler.js # JWT authentication (protects private routes)
    └── errorHandler.js         # Centralized error handling (catches thrown errors)
```

## Architecture Layers

### 1. Routes (`routes/`)
- Define HTTP endpoints and HTTP methods (GET, POST, PUT, DELETE).
- Mount middleware (e.g., `validateTokenHandler`) to protect routes.
- Delegate logic to controllers.

**contactRoutes.js:**
```js
router.use(validateToken); // Protect all routes
router.route('/').get(getAllContacts).post(createContact);
router.route('/:id').get(getContactById).put(updateContact).delete(deleteContact);
```

**userRoutes.js:**
```js
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/current', validateToken, getCurrentUser);
```

### 2. Controllers (`controllers/`)
- Handle request/response logic.
- Call models to fetch/modify data.
- Perform business logic (ownership checks, validation, etc.).
- Return JSON responses with appropriate HTTP status codes.

**contactControllers.js:**
```js
const getContactById = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(404);
        throw new Error("Contact not found");
    }
    // Verify user owns this contact
    if (contact.user_id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("User not authorized");
    }
    res.status(200).json(contact);
});
```

**userController.js:**
```js
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // Hash password, create user, return JWT
});

const loginUser = asyncHandler(async (req, res) => {
    // Verify credentials, generate JWT
});
```

### 3. Models (`models/`)
- Define Mongoose schemas (field names, types, validation).
- Export models to interact with MongoDB collections.
- Handle data structure and constraints at the database level.

**contactModel.js:**
```js
const contactSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
```

**userModel.js:**
```js
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

### 4. Middleware (`middleware/`)

**validateTokenHandler.js** — JWT Authentication
- Extracts token from `Authorization: Bearer <token>` header.
- Verifies signature using `JWT_SECRET`.
- Attaches decoded user info to `req.user`.
- Returns 401 if missing or invalid.

```js
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401);
        throw new Error('No token, authorization denied');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403);
        throw new Error('Invalid token');
    }
};
```

**errorHandler.js** — Centralized Error Handling
- Catches errors thrown by controllers.
- Formats error response with status code and message.
- Called after all route handlers.

```js
const errorHandler = (err, req, res, next) => {
    const status = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(status).json({
        title: err.message,
        message: err.message,
        stackTrace: process.env.NODE_ENV === 'development' ? err.stack : ''
    });
};
```

### 5. Config (`config/`)

**dbConnection.js** — MongoDB Connection Wrapper
- Wraps `mongoose.connect()` with error handling.
- Reads `CONNECTION_STRING` from environment variables.
- Called once at app startup.

```js
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`MongoDB connected: ${connect.connection.host}, ${connect.connection.name}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### 6. Entry Point (`server.js`)

- Load environment variables (`require('dotenv').config()`).
- Connect to MongoDB (`connectDB()`).
- Attach global middleware (JSON parsing, error handler).
- Mount route handlers (`app.use('/api/contacts', contactRoutes)`).
- Start HTTP server (`app.listen(PORT, ...)`).

```js
require('dotenv').config();
const connectDB = require('./config/dbConnection');
const app = express();

connectDB();
app.use(express.json());
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
```

## Request Flow Diagram

```
┌─────────────────────┐
│   HTTP Request      │
│ GET /api/contacts   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│         server.js                   │
│  ├─ dotenv.config()                │
│  ├─ connectDB()                    │
│  ├─ app.use(json)                  │
│  └─ app.use(routes)                │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      routes/contactRoutes.js        │
│  ├─ Match endpoint                  │
│  ├─ Match HTTP method (GET)         │
│  └─ Apply middleware chain          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   middleware/validateTokenHandler   │
│  ├─ Extract token from header       │
│  ├─ Verify JWT signature            │
│  ├─ Attach req.user                 │
│  └─ Call next()                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  controllers/contactControllers.js  │
│  ├─ Validate ownership              │
│  ├─ Call Contact.findById()         │
│  └─ Return JSON response (200)      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   models/contactModel.js (Mongoose) │
│  ├─ Query MongoDB                   │
│  ├─ Apply schema validation         │
│  └─ Return document or null         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│      HTTP Response                  │
│  {                                  │
│    "_id": "...",                    │
│    "name": "John Doe",              │
│    "email": "john@example.com"      │
│  }                                  │
│  Status: 200 OK                     │
└─────────────────────────────────────┘
```

## Design Patterns

### MVC (Model-View-Controller)
- **Model:** Mongoose schemas & models (`models/`)
- **View:** JSON responses (no traditional HTML)
- **Controller:** Business logic & request handling (`controllers/`)

### Layered / N-Tier Architecture
- Clear separation of concerns.
- Each layer has a single responsibility.
- Easy to test, maintain, and scale independently.

### Middleware Pattern
- Middleware wraps route handlers.
- Common tasks (auth, error handling) are centralized.
- `asyncHandler` catches async errors and passes to `errorHandler`.

### JWT Authentication
- Stateless: no session storage required.
- Token issued at login, verified on every protected request.
- User info extracted from token payload and attached to `req.user`.

### Ownership Checks
- Controllers verify resource ownership before returning/modifying.
- Prevents users from accessing/modifying other users' contacts.
- Returns 403 Forbidden if user is not the owner.

## Key Principles

| Principle | Implementation |
|-----------|-----------------|
| **DRY (Don't Repeat Yourself)** | Reuse controllers, models, middleware across routes. |
| **Single Responsibility** | Routes handle routing; controllers handle logic; models handle DB. |
| **Separation of Concerns** | Env config in `.env`; DB logic in models; API logic in controllers. |
| **Error Handling** | Centralized in `errorHandler.js`; controllers throw, middleware catches. |
| **Security** | JWT auth via `validateTokenHandler`; ownership checks in controllers. |
| **Scalability** | Add new routes/controllers/models without touching existing code. |

## Comparison to Other Frameworks

| Framework | Pros | Cons | Best For |
|-----------|------|------|----------|
| **Express MVC (this project)** | Simple, lightweight, flexible | Less structured, needs discipline | Small-to-medium APIs |
| **NestJS** | TypeScript, DI, decorators, batteries included | Steep learning curve, opinionated | Enterprise, complex APIs |
| **Django** | Batteries included, ORM, admin panel | Python-specific, heavier | Full-stack web apps |
| **Spring Boot** | Mature, scalable, type-safe | Heavy, verbose, Java-based | Large enterprise systems |
| **Fastapi** | Modern, async, auto-docs | Python-specific | Data science APIs, prototypes |

## Next Steps & Improvements

- [ ] Add **input validation** (Joi, express-validator) in routes.
- [ ] Add **unit tests** for controllers and models (Jest, Mocha).
- [ ] Add **integration tests** for full request flow.
- [ ] Add **rate limiting** middleware for API protection.
- [ ] Add **logging** (Winston, Pino) for debugging.
- [ ] Add **API documentation** (Swagger/OpenAPI).
- [ ] Migrate to **TypeScript** for type safety.
- [ ] Consider **NestJS** if the project grows significantly.
