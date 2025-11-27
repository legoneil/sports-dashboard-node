document.addEventListener("DOMContentLoaded", () => {
    loadSports("nfl", "nflSection", false);
    loadSports("nba", "nbaSection", false);
    loadSports("mlb", "mlbSection", false);
    loadSports("nhl", "nhlSection", false);
    loadSports("cfb", "cfbSection", true);
});

async function loadSports(league, sectionId, isCFB) {
    const section = document.getElementById(sectionId);

    try {
        const res = await fetch(`https://site.api.espn.com/apis/v2/sports/${league}/scoreboard`);
        const data = await res.json();

        const events = (data.events || []).filter(game => {
            // Filter for today only
            const gameDate = new Date(game.date).toDateString();
            const today = new Date().toDateString();
            if (gameDate !== today) return false;

            // Valid statuses
            const status = game?.status?.type?.name?.toLowerCase() || "";

            return (
                status.includes("status-final") ||
                status.includes("final") ||
                status.includes("in-progress") ||
                status.includes("live")
            );
        });

        if (events.length === 0) {
            section.innerHTML = `<p class="no-games">No games today</p>`;
            return;
        }

        section.innerHTML = events.map(game => formatGame(game, isCFB)).join("");

    } catch (err) {
        console.error(err);
        section.innerHTML = `<p class="no-games">Could not load games</p>`;
    }
}

function formatGame(game, isCFB) {
    const comp = game.competitions[0];
    const status = game.status.type.shortDetail || "";
    const home = comp.competitors.find(t => t.homeAway === "home");
    const away = comp.competitors.find(t => t.homeAway === "away");

    if (isCFB) {
        return `
            <div class="game-card">
                <h3>${game.name}</h3>
                <p>${away.team.displayName}: ${away.score}</p>
                <p>${home.team.displayName}: ${home.score}</p>
                <p>${status}</p>
                <small>${comp.venue.fullName}</small>
            </div>
        `;
    }

    return `
        <div class="game-card">
            <h3>${away.team.displayName} @ ${home.team.displayName}</h3>
            <p>${away.score} - ${home.score}</p>
            <p>${status}</p>
        </div>
    `;
}
