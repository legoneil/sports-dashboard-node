async function loadScores() {
  loadSection("/api/nfl", "nfl");
  loadSection("/api/nba", "nba");
  loadSection("/api/cfb", "cfb");
}

async function loadSection(api, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(api);
    const data = await res.json();

    if (!data.events) {
      container.innerHTML = "No data.";
      return;
    }

    // Filter only games happening today
    const todayGames = data.events.filter(event => {
      const gameDate = new Date(event.date);
      const today = new Date();
      return gameDate.toDateString() === today.toDateString();
    });

    // Map and display
    container.innerHTML = todayGames.map(event => {
      const c = event.competitions[0].competitors;

      // Determine winner/loser for color coding
      const score0 = parseInt(c[0].score || 0);
      const score1 = parseInt(c[1].score || 0);

      let team0Color = "black"; 
      let team1Color = "black";

      if (event.status.type.state === "post" || event.status.type.state === "in") {
        if (score0 > score1) {
          team0Color = "green";
          team1Color = "red";
        } else if (score1 > score0) {
          team1Color = "green";
          team0Color = "red";
        }
      }

      // Quarter/clock display
      let quarterText = "";
      if (event.status && event.status.type) {
        if (event.status.type.state === "pre") {
          quarterText = "Not started";
        } else if (event.status.type.state === "in") {
          quarterText = event.status.type.shortDetail; // e.g., "Q2 5:32"
        } else if (event.status.type.state === "post") {
          quarterText = "Final";
        }
      }

      return `
        <div class="game">
          <div class="team">
            <img src="${c[0].team.logo}" alt="${c[0].team.displayName}" width="30" height="30">
            <span style="color:${team0Color}">${c[0].team.displayName} ${c[0].score}</span>
          </div>
          <div class="team">
            <img src="${c[1].team.logo}" alt="${c[1].team.displayName}" width="30" height="30">
            <span style="color:${team1Color}">${c[1].team.displayName} ${c[1].score}</span>
          </div>
          <div class="quarter">${quarterText}</div>
        </div>
      `;
    }).join("");

    if (todayGames.length === 0) {
      container.innerHTML = "No games today.";
    }

  } catch {
    container.innerHTML = "Error loading scores.";
  }
}

loadScores();
setInterval(loadScores, 60000);
