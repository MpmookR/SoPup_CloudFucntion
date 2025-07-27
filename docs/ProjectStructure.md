## Best Practices: Project Structure, CORS, Middleware, and MVC

### Project Structure

```
functions/
└── src/
    ├── controllers/          # Handles routing and delegates to services (e.g., matchRequestController.ts)
    ├── services/             # Business logic lives here (e.g., scoring, filtering, request creation)
    ├── repositories/         # Isolated Firestore queries and persistence logic (e.g., dogRepository.ts)
    ├── models/               # Shared data interfaces and enums
    ├── middleware/           # Express middleware (e.g., auth.ts)
    ├── config/               # Firebase admin setup, CORS config
    └── index.ts              # Entry point for exporting cloud functions

```

### Middleware

- **Middleware** is code that runs before or after your main function (controller) logic.
- Common uses: authentication, logging, input validation, error handling, CORS.
- In serverless, middleware can be implemented as reusable functions that wrap your handlers.
- Example (Node.js style):
    ```js
    // src/middleware/auth.js
    module.exports = (handler) => async (event, context) => {
        // Authentication logic here
        return handler(event, context);
    };
    ```

### CORS (Cross-Origin Resource Sharing)

- **Centralize CORS configuration** in `src/config/cors.js` or equivalent.
- Use middleware to handle CORS for all functions.
- Restrict allowed origins, methods, and headers as tightly as possible.
- Example (Node.js/Express style):
    ```js
    // src/config/cors.js
    module.exports = {
        origin: ['https://your-frontend.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    ```





