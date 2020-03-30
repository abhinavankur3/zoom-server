# Zoom Server

Run server:

```bash
npm install
npm run start
```

### Setup dotenv

Create a `.env` file in which to store your PORT, access credentials, and Redirect URL.

```
clientID=
clientSecret=
redirectURL=
apiKey=
apiSecret=
```

> Remember: Never share or store your client credentials publicly. Your `.env` is included in the `.gitignore` file to ensure these files won't be included in a git workflow.
