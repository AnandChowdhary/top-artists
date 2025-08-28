# 🎸 Billboard Hot 100 - Anand's Version

This repository automatically generates a weekly list of my top 5 most listened to artists using the Spotify Web API.

<!--start-generated-->

| #   | Image                                                                                                             | Artist            | Rank |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------- | ---- |
| 1   | <img src="https://i.scdn.co/image/ab6761610000f178f6d51e6f5342d2d363220920" width="64" alt="Gracie Abrams" />     | Gracie Abrams     | ➖   |
| 2   | <img src="https://i.scdn.co/image/ab6761610000f17878e45cfa4697ce3c437cb455" width="64" alt="Sabrina Carpenter" /> | Sabrina Carpenter | ➖   |
| 3   | <img src="https://i.scdn.co/image/ab6761610000f1788b521134ae0ba3f60aab6811" width="64" alt="Maisie Peters" />     | Maisie Peters     | ➖   |
| 4   | <img src="https://i.scdn.co/image/ab6761610000f178e672b5f553298dcdccb0e676" width="64" alt="Taylor Swift" />      | Taylor Swift      | 🔺 1 |
| 5   | <img src="https://i.scdn.co/image/ab6761610000f17848aa5f4b5eb4e71bf34b3492" width="64" alt="Claire Rosinkranz" /> | Claire Rosinkranz | 🔻 1 |

<!--end-generated-->

## ⚙️ Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the project root with your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   # You will obtain the following two after running generate-token.mjs
   SPOTIFY_ACCESS_TOKEN=your_spotify_access_token
   SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
   ```
3. You will only have the first two variables (`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`) initially. To obtain the access and refresh tokens, run:
   ```sh
   node generate-token.mjs
   ```
   Then, copy the generated `SPOTIFY_ACCESS_TOKEN` and `SPOTIFY_REFRESH_TOKEN` into your `.env` file as shown above.
4. Start the application:
   ```sh
   npm run start
   ```

## 📃 License

[MIT](./LICENSE) ©️ [Anand Chowdhary](https://anandchowdhary.com)
