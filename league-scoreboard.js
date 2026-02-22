// Get league from URL
const urlParams = new URLSearchParams(window.location.search);
const fileName = urlParams.get("league");

let startEpisode;

// High School Friends League counts from Episode 1
if (fileName === "league1.json") {
  startEpisode = 1;
}

// Family League counts from Episode 2 onward
else if (fileName === "league2.json") {
  startEpisode = 2;
}

// default fallback
else {
  startEpisode = 1;
}

// If no league provided, redirect
if (!fileName) {
  window.location.href = "league.html";
}

fetch(fileName)
  .then(response => response.json())
  .then(data => {

    const container = document.getElementById("playerScoreboardContainer");
    const title = document.getElementById("leagueTitle");

    title.innerText = `${data.leagueName} - Player Scoreboard`;

    const players = data.players;
    const episodes = data.episodes;

    // Detect special league rules
    const isHighSchoolLeague = data.leagueName === "High School Friends";

    // Determine episode start index
    const startingEpisodeIndex = isHighSchoolLeague ? 0 : 1;

    // =========================
    // OVERALL PLAYER TOTALS
    // =========================

    const overallTotals = players.map(player => {
      let total = 0;

      episodes.forEach((episode, index) => {

        if (index < startingEpisodeIndex) return;

        // Skip episode if eliminated before it
        if (player.eliminatedAfter !== undefined &&
            index > player.eliminatedAfter) return;

        total += episode.scores[player.teamName] || 0;
      });

      return {
        name: player.teamName,
        total: total
      };
    });

    overallTotals.sort((a, b) => b.total - a.total);

    const overallHeader = document.createElement("h2");
    overallHeader.innerText = "Overall Player Leaderboard";
    container.appendChild(overallHeader);

    overallTotals.forEach(player => {
      const div = document.createElement("div");
      div.className = "score-row";
      div.innerText = `${player.name}: ${player.total}`;
      container.appendChild(div);
    });

    // =========================
    // EPISODE LEADERBOARDS
    // =========================

    episodes.forEach((episode, index) => {

      if (index < startingEpisodeIndex) return;

      const episodeHeader = document.createElement("h2");
      episodeHeader.innerText = episode.name;
      container.appendChild(episodeHeader);

      let episodeScores = [];

      players.forEach(player => {

        // Exclude eliminated players
        if (player.eliminatedAfter !== undefined &&
            index > player.eliminatedAfter) return;

        episodeScores.push({
          name: player.teamName,
          score: episode.scores[player.teamName] || 0
        });
      });

      episodeScores.sort((a, b) => b.score - a.score);

      episodeScores.forEach(player => {
        const div = document.createElement("div");
        div.className = "score-row";
        div.innerText = `${player.name}: ${player.score}`;
        container.appendChild(div);
      });

    });

  })
  .catch(error => {
    console.error("Error loading league:", error);
  });
