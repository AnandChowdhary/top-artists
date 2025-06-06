import "dotenv/config";
import http from "http";
import open from "open";
import SpotifyWebApi from "spotify-web-api-node";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
const SPOTIFY_REDIRECT_URI = "http://localhost:3000/callback";

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment."
  );
  process.exit(1);
}

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: SPOTIFY_REDIRECT_URI,
});

const scopes = ["user-read-private", "user-read-email"];

async function main() {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state");
  console.log("Opening the following URL in your browser:");
  console.log(authorizeURL);
  await open(authorizeURL);

  // Start HTTP server to listen for the callback
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/callback")) {
      const url = new URL(req.url, "http://localhost:3000");
      const code = url.searchParams.get("code");
      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authorization successful! You can close this window.</h1>"
        );
        server.close();
        try {
          const data = await spotifyApi.authorizationCodeGrant(code);
          console.log("Access token:", data.body["access_token"]);
          console.log("Refresh token:", data.body["refresh_token"]);
          console.log("Expires in:", data.body["expires_in"]);
        } catch (err) {
          console.error("Error retrieving tokens:", err.message || err);
        }
      } else {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>No code found in the callback.</h1>");
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(3000, () => {
    console.log(
      "Listening for Spotify callback on http://localhost:3000/callback ..."
    );
  });
}

main();
