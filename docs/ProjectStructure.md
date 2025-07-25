## Best Practices: Project Structure, CORS, Middleware, and MVC

### Project Structure

```
project-root/
│
├── src/
│   ├── functions/          # Serverless functions (controllers)
│   ├── models/             # Data models (e.g., database schemas)
│   ├── services/           # Business logic and reusable services
│   ├── middleware/         # Custom middleware (e.g., auth, logging, CORS)
│   ├── helpers/                # Shared utilities/helpers
│   └── config/             # Configuration files (CORS, DB, etc.)
│
├── tests/                  # Unit and integration tests
├── scripts/                # Deployment or utility scripts
├── .env                    # Environment variables (never commit secrets)
├── serverless.yml          # Serverless framework config (or equivalent)
├── package.json            # Project metadata and dependencies
├── README.md               # Project overview and instructions
└── docs/                   # Documentation
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

### MVC Pattern in Serverless

- **Model:** Define data models in `src/models/`.
- **View:** In serverless APIs, the "view" is typically the JSON response.
- **Controller:** Each function in `src/functions/` acts as a controller, handling requests and responses.
- **Service:** Place business logic in `src/services/` to keep controllers thin and maintainable.



