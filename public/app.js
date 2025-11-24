async function loadScores() {
  loadSection("/api/nfl", "nfl");
  loadSection("/api/nba", "nba");
  loadSection("/api/cfb", "cfb");
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

    container.innerHTML = data.events
      .map(event => {
        const c = event.competitions[0].competitors;

        // Scores
        const score0 = parseInt(c[0].score || 0);
        const score1 = parseInt(c[1].score || 0);

        // Color logic
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

        // Quarter / game state
        let quarterText = "";
        if (event.status && event.status.type) {
          if (event.status.type.state === "pre") {
            quarterText = "Not started";
          } else if (event.status.type.state === "in") {
            quarterText = event.status.type.shortDetail;
          } else if (event.status.type.state === "post") {
            quarterText = "Final";
          }
        }

        // ➕ Possession + Down & Distance
        // ➕ Possession + Down & Distance (fixed for -1)
let possession = "";
let downAndDist = "Down Pending";

const situation = event.competitions[0].situation;

if (situation) {
  // possession
  if (situation.possession) {
    possession = situation.possession.toString();
  }

  // down & distance
  const down = situation.down;
  const dist = situation.distance;

  if (down >= 1 && down <= 4) {
    if (dist && dist > 0) {
      downAndDist = `${down} & ${dist}`;
    } else {
      downAndDist = `${down} & Pending`;
    }
  } else {
    downAndDist = "Down Pending";
  }
}

        // FINAL TEMPLATE (with centered down marker)
        return `
          <div class="game">
            <div class="team">
              <img src="${c[0].team.logo}" width="30" height="30">
              <span style="color:${team0Color}">
                ${c[0].team.displayName} ${c[0].score}
                ${possession === c[0].id ? "🏈" : ""}
              </span>
            </div>

            <div class="down-marker">
              ${downAndDist ? `${downAndDist}` : ""}
            </div>

            <div class="team">
              <img src="${c[1].team.logo}" width="30" height="30">
              <span style="color:${team1Color}">
                ${c[1].team.displayName} ${c[1].score}
                ${possession === c[1].id ? "🏈" : ""}
              </span>
            </div>

            <div class="quarter">
              ${quarterText}
            </div>
          </div>
        `;
      })
      .join("");

  } catch {
    container.innerHTML = "Error loading scores.";
  }
}


loadScores();
setInterval(loadScores, 10000);
