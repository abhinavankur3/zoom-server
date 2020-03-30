// Bring in environment secrets through dotenv
require("dotenv/config");

// Use the request module to make HTTP requests from Node
const request = require("request");
const rp = require("request-promise");

// Run the express app
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const crypto = require("crypto"); // crypto comes with Node.js

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.all("/", (req, res) => {
  res.send({ result: "Welcome" });
});

app.get("/auth", (req, res) => {
  // Step 1:
  // Check if the code parameter is in the url
  // if an authorization code is available, the user has most likely been redirected from Zoom OAuth
  // if not, the user needs to be redirected to Zoom OAuth to authorize
  console.log("code >> ", req.query);
  if (req.query.code) {
    // Step 3:
    // Request an access token using the auth code
    let url =
      "https://zoom.us/oauth/token?grant_type=authorization_code&code=" +
      req.query.code +
      "&redirect_uri=" +
      process.env.redirectURL;

    request
      .post(url, (error, response, body) => {
        console.log(error);

        // Parse response to JSON
        body = JSON.parse(body);

        // Logs your access and refresh tokens in the browser
        console.log(`access_token: ${body.access_token}`);
        console.log(`refresh_token: ${body.refresh_token}`);

        if (body.access_token) {
          // Step 4:
          // We can now use the access token to authenticate API calls
          // Send a request to get your user information using the /me context
          // The `/me` context restricts an API call to the user the token belongs to
          // This helps make calls to user-specific endpoints instead of storing the userID
        } else {
          // Handle errors, something's gone wrong!
        }
      })
      .auth(process.env.clientID, process.env.clientSecret);

    return;
  }

  // Step 2:
  // If no authorization code is available, redirect to Zoom OAuth to authorize
  res.redirect(
    "https://zoom.us/oauth/authorize?response_type=code&client_id=" +
      process.env.clientID +
      "&redirect_uri=" +
      process.env.redirectURL
  );
});

// Please update these token
const TOKENS = {
  access_token:
    "eyJhbGciOiJIUzUxMiIsInYiOiIyLjAiLCJraWQiOiI0ODYzNTQxMC03ZmVkLTQzNDMtYjZkNS0wZDg2Zjg3MWMwYzYifQ.eyJ2ZXIiOiI2IiwiY2xpZW50SWQiOiJBMHVVaWV0U1NFdWFaN0dKZzI0c2hRIiwiY29kZSI6IlU0TGs1Tm55S1NfU3VHZXdNZUtTN3VHZUNnZjJYQlBZZyIsImlzcyI6InVybjp6b29tOmNvbm5lY3Q6Y2xpZW50aWQ6QTB1VWlldFNTRXVhWjdHSmcyNHNoUSIsImF1dGhlbnRpY2F0aW9uSWQiOiI5Yjg2MGM4NDMwNTdjZjI1N2FkZjNlOGNjYzhkYzdiYiIsInVzZXJJZCI6IlN1R2V3TWVLUzd1R2VDZ2YyWEJQWWciLCJncm91cE51bWJlciI6MCwiYXVkIjoiaHR0cHM6Ly9vYXV0aC56b29tLnVzIiwiYWNjb3VudElkIjoiWXJEVjVVUTFRd3lldXh6N0lVc0tQdyIsIm5iZiI6MTU4NTU1NDIyOSwiZXhwIjoxNTg1NTU3ODI5LCJ0b2tlblR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE1ODU1NTQyMjksImp0aSI6IjE0ZGQ2YWRkLWIyY2MtNGJmNy1hNWQwLWNiYzRhZDYwMmI0NSIsInRvbGVyYW5jZUlkIjo0fQ.Dda5TNLhyO09SjMw8jSHMoBrhfoCJ4MJjk_xgFwbe0xN1cUw5yygJvkRmODMXh8BLDD17EJc9K4cQrkYu3qvkQ",
  token_type: "bearer",
  refresh_token:
    "eyJhbGciOiJIUzUxMiIsInYiOiIyLjAiLCJraWQiOiI0MGM1Y2JmNC1mZjZlLTRiZmItODc3Zi0zODY3NDU4MDc5NWQifQ.eyJ2ZXIiOiI2IiwiY2xpZW50SWQiOiJBMHVVaWV0U1NFdWFaN0dKZzI0c2hRIiwiY29kZSI6IlU0TGs1Tm55S1NfU3VHZXdNZUtTN3VHZUNnZjJYQlBZZyIsImlzcyI6InVybjp6b29tOmNvbm5lY3Q6Y2xpZW50aWQ6QTB1VWlldFNTRXVhWjdHSmcyNHNoUSIsImF1dGhlbnRpY2F0aW9uSWQiOiI5Yjg2MGM4NDMwNTdjZjI1N2FkZjNlOGNjYzhkYzdiYiIsInVzZXJJZCI6IlN1R2V3TWVLUzd1R2VDZ2YyWEJQWWciLCJncm91cE51bWJlciI6MCwiYXVkIjoiaHR0cHM6Ly9vYXV0aC56b29tLnVzIiwiYWNjb3VudElkIjoiWXJEVjVVUTFRd3lldXh6N0lVc0tQdyIsIm5iZiI6MTU4NTU1NDIyOSwiZXhwIjoyMDU4NTk0MjI5LCJ0b2tlblR5cGUiOiJyZWZyZXNoX3Rva2VuIiwiaWF0IjoxNTg1NTU0MjI5LCJqdGkiOiJjNmIxYjk0Yi04OGZkLTQ0MzMtODJiZC04ZDg0YzhkZWRmM2QiLCJ0b2xlcmFuY2VJZCI6NH0.sS8HaN-XC5XfTMKyVafdkM3zEWsad3SdFXKf4E3cq4wmK7OZUYQB_fN2hNr-qnNNLRqxzEg03KaeuuGQEtB1FA",
  expires_in: 3599,
  scope: "meeting:master meeting:read:admin meeting:write:admin user:write:admin"
};

app.get("/newToken", (req, res) => {
  const url = `https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`;
  request
    .post(url, (error, response, body) => {
      console.log(error);

      // Parse response to JSON
      body = JSON.parse(body);

      // Logs your access and refresh tokens in the browser
      console.log(`New Token: ${body}`);
      res.send(body);
    })
    .auth(process.env.clientID, process.env.clientSecret);
});

app.get("/users", (req, res) => {
  request
    .get("https://api.zoom.us/v2/users/me", (error, response, body) => {
      if (error) {
        console.log("API Response Error: ", error);
      } else {
        body = JSON.parse(body);
        // Display response in console
        console.log("API call ", body);
        // Display response in browser
        var JSONResponse = JSON.stringify(body, null, 2);
        res.send(JSONResponse);
      }
    })
    .auth(null, null, true, TOKENS.access_token);
});

app.get("/meetings", async (req, res) => {
  try {
    const response = await rp({
      url: "https://api.zoom.us/v2/users/me/meetings",
      method: "get"
    }).auth(null, null, true, TOKENS.access_token);
    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

app.post("/meetings", async (req, res) => {
  try {
    console.log("create meeting >> ", req.body);
    const response = await rp({
      url: "https://api.zoom.us/v2//users/me/meetings",
      method: "post",
      json: req.body
    }).auth(null, null, true, TOKENS.access_token);
    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

const generateSignature = (apiKey, apiSecret, meetingNumber, role) => {
  // Prevent time sync issue between client signature generation and zoom
  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString("base64");
  const hash = crypto
    .createHmac("sha256", apiSecret)
    .update(msg)
    .digest("base64");
  const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString("base64");

  return signature;
};

app.post("/generateSignature", async (req, res) => {
  try {
    console.log("generateSignature request >> ", req.body);
    // Need to auth user and check if Teacher or student
    // if (Teacher) role = 1; else role = 0;
    let meetingNumber;
    let role, signature;
    if (meetingNumber & role) {
      signature = generateSignature(process.env.apiKey, process.env.apiSecret, meetingNumber, role);
    } else {
      signature = "NOT_FOUND";
    }
    res.send({ signature });
  } catch (err) {
    res.send(err);
  }
});

app.listen(4000, () => console.log(`Zoom Hello World app listening at PORT: 4000`));
