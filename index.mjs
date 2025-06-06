import "dotenv/config";
import fs from "fs/promises";
import SpotifyWebApi from "spotify-web-api-node";

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_REFRESH_TOKEN,
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_ACCESS_TOKEN) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET or SPOTIFY_ACCESS_TOKEN in environment."
  );
  process.exit(1);
}

const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  accessToken: SPOTIFY_ACCESS_TOKEN,
  refreshToken: SPOTIFY_REFRESH_TOKEN,
});

async function generate() {
  const data = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(data.body["access_token"]);
  console.log("The access token has been refreshed!");

  /** @type {import("./types").TopArtistsResult} */
  const topArtists = (await spotifyApi.getMyTopArtists("short_term")).body
    .items;
  const top10 = topArtists.slice(0, 5);

  // Format as markdown table with image
  const table = [
    "| #   | Image | Artist |",
    "| --- | ----- | ------ |",
    ...top10.map((artist, i) => {
      let image = "";
      if (artist.images && artist.images.length > 0) {
        // Pick the smallest image (last in the array)
        const smallest = artist.images[artist.images.length - 1];
        image = `<img src=\"${smallest.url}\" width=\"64\" alt=\"${artist.name}\" />`;
      }
      return `| ${i + 1}   | ${image} | ${artist.name} |`;
    }),
  ].join("\n");

  // Read README.md
  const readmePath = "README.md";
  let readme = await fs.readFile(readmePath, "utf-8");

  // Replace section between markers
  readme = readme.replace(
    /(<!--start-generated-->)([\s\S]*?)(<!--end-generated-->)/,
    `<!--start-generated-->\n${table}\n\n<!--end-generated-->`
  );

  // Write back to README.md
  await fs.writeFile(readmePath, readme);

  // Save top 5 artists as JSON in data/[date].json
  const today = new Date().toISOString().slice(0, 10);
  const dataDir = "data";
  const jsonPath = `${dataDir}/${today}.json`;
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(top10, null, 2));
}

generate().then(console.log).catch(console.error);
