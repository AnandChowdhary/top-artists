import "dotenv/config";
import fs from "fs/promises";
import prettier from "prettier";
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
  const dataDir = "data";
  const today = new Date().toISOString().slice(0, 10);
  const data = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(data.body["access_token"]);

  /** @type {import("./types").TopArtistsResult} */
  const topArtists = (await spotifyApi.getMyTopArtists("short_term")).body
    .items;
  const topFive = topArtists.slice(0, 5);

  // Find previous data file (the most recent one before today)
  const files = await fs.readdir(dataDir);
  const prevFile = files
    .filter((f) => f.endsWith(".json") && f !== `${today}.json`)
    .sort()
    .pop();
  let prevRanks = {};
  if (prevFile) {
    try {
      const prevData = JSON.parse(
        await fs.readFile(`${dataDir}/${prevFile}`, "utf-8")
      );
      prevData.forEach((artist) => {
        prevRanks[artist.name] = artist.rank;
      });
    } catch (e) {
      // ignore
    }
  }

  // Format as markdown table with image and rank diff
  const table = [
    "| #   | Image | Artist | Rank |",
    "| --- | ----- | ------ | ---- |",
    ...topFive.map((artist, i) => {
      let image = "";
      if (artist.images && artist.images.length > 0) {
        // Pick the smallest image (last in the array)
        const smallest = artist.images[artist.images.length - 1];
        image = `<img src=\"${smallest.url}\" width=\"64\" alt=\"${artist.name}\" />`;
      }
      const prevRank = prevRanks[artist.name];
      let rankDiff = "➖";
      if (prevRank !== undefined) {
        if (prevRank > i + 1) rankDiff = `🔺 ${prevRank - (i + 1)}`;
        else if (prevRank < i + 1) rankDiff = `🔻 ${i + 1 - prevRank}`;
      }
      return `| ${i + 1}   | ${image} | ${artist.name} | ${rankDiff} |`;
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
  await fs.writeFile(
    readmePath,
    await prettier.format(readme, { parser: "markdown" })
  );

  // Save top 5 artists as JSON in data/[date].json
  const jsonPath = `${dataDir}/${today}.json`;
  await fs.mkdir(dataDir, { recursive: true });
  const jsonData = topFive.map((artist, i) => ({
    name: artist.name,
    href: artist.href,
    img:
      artist.images && artist.images.length > 0
        ? artist.images[artist.images.length - 1].url
        : null,
    rank: i + 1,
  }));
  await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2) + "\n");
  await fs.writeFile("api.json", JSON.stringify(jsonData, null, 2) + "\n");
}

generate().then(console.log).catch(console.error);
