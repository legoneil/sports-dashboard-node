async function loadScores() {
  loadSection("/api/nfl", "nfl", "nfl");
  loadSection("/api/nba", "nba", "nba");
  loadSection("/api/cfb", "cfb", "cfb");
  renderMobileGames(games);
}

function renderMobileGames(games) {
  const container = document.getElementById("games-mobile");
  container.innerHTML = "";

  games.forEach(game => {
    const awayWin = game.awayScore > game.homeScore;
    const homeWin = game.homeScore > game.awayScore;

    const div = document.createElement("div");
    div.className = "mobile-game";

    div.innerHTML = `
      <div class="mobile-row">
        <img class="team-logo" src="logos/${game.awayTeam}.png">
        <span class="team-name">${game.awayTeam}</span>
        <span class="team-score ${awayWin ? "win" : "loss"}">${game.awayScore}</span>
      </div>

      <div class="mobile-row">
        <img class="team-logo" src="logos/${game.homeTeam}.png">
        <span class="team-name">${game.homeTeam}</span>
        <span class="team-score ${homeWin ? "win" : "loss"}">${game.homeScore}</span>
      </div>

      <div class="mobile-status">${game.quarter} — ${game.clock}</div>
    `;

    container.appendChild(div);
  });
}

async function loadSection(api, elementId, sport) {
  const container = document.getElementById(elementId);
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(api);
    const data = await res.json();

    if (!data.events) {
      container.innerHTML = "No data.";
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let html = "";

    data.events.forEach(event => {
      const competition = event.competitions?.[0];
      if (!competition) return;

      // Only show today's games
      const gameDate = event.date.split("T")[0];
      if (gameDate !== todayStr) return;

      const c = competition.competitors;
      const team0 = c[0];
      const team1 = c[1];

      const score0 = parseInt(team0.score || 0);
      const score1 = parseInt(team1.score || 0);

      // Score colors
      let team0Color = "black";
      let team1Color = "black";
      const state = event.status?.type?.state;

      if (state === "post" || state === "in") {
        if (score0 > score1) {
          team0Color = "green";
          team1Color = "red";
        } else if (score1 > score0) {
          team1Color = "green";
          team0Color = "red";
        }
      }

      // Status text (clean)
      let statusText = "";
      if (state === "pre") statusText = "Not started";
      else if (state === "post") statusText = "Final";
      else if (state === "in") statusText = event.status?.type?.shortDetail || "Live";

      // ⚠️ FOOTBALL DATA ONLY FOR NFL
      let team0Ball = false;
      let team1Ball = false;
      let downText = "";

      if (sport === "nfl" && state === "in") {
        const sit = competition.situation;

        if (sit?.possession) {
          team0Ball = sit.possession == team0.id;
          team1Ball = sit.possession == team1.id;
        }

        const d = sit?.down;
        const dist = sit?.distance;

        if (d >= 1 && d <= 4) {
          downText = dist > 0 ? `${d} & ${dist}` : `${d} & Pending`;
        } else {
          downText = "Down Pending";
        }
      }

      html += `
        <div class="game">
          <div class="team">
            <img src="${team0.team.logo}" width="30" height="30">
            <span style="color:${team0Color}">
              ${team0Ball ? "🏈 " : ""}${team0.team.displayName} ${team0.score}
            </span>
          </div>

          <div class="down-marker">
            ${sport === "nfl" && state === "in" ? downText : ""}
          </div>

          <div class="team">
            <img src="${team1.team.logo}" width="30" height="30">
            <span style="color:${team1Color}">
              ${team1Ball ? "🏈 " : ""}${team1.team.displayName} ${team1.score}
            </span>
          </div>

          <div class="quarter">${statusText}</div>
        </div>
      `;
    });

    container.innerHTML = html.tr
