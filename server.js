import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

async function fetchESPN(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch {
    return { error: "Failed to fetch data." };
  }
}

// --- NFL ---
app.get("/api/nfl", async (req, res) => {
  const data = await fetchESPN("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard");
  res.json(data);
});

// --- NBA ---
app.get("/api/nba", async (req, res) => {
  const data = await fetchESPN("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard");
  res.json(data);
});

// --- College Football ---
app.get("/api/cfb", async (req, res) => {
  const data = await fetchESPN("https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard");
  res.json(data);
});

const PORT = process.env.PORT || 3000; // Use Render's assigned port, fallback to 3000 locally
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

