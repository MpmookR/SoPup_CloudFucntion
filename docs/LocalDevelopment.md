# Local Development: How to Test Locally
To test your Cloud Function locally using emulators and Postman, follow these steps:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env` file in the project root and add any required environment variables.

## 3. Start the Emulator

Start the Firebase Functions emulator:

```bash
You can use the following command to start all available emulators, including Functions:

```bash
firebase emulators:start
```

If you want to start only the Functions emulator, use:

```bash
firebase emulators:start --only functions
```

## 4. Test with Postman

- Open Postman.
- Send an HTTP request to your local function endpoint:
    ```
    http://localhost:5001/<project-id>/us-central1/<function-name>
    ```
- Set the method (e.g., POST) and body as needed.

## 5. View Logs

Check the terminal for logs and errors during execution.

---

**Tip:** Restart the emulator after making code changes.
