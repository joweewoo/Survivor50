// ======================================================
// SCOREBOARD ROUTING
// ======================================================

window.addEventListener("DOMContentLoaded", () => {

  if (window.location.pathname.includes("team-scoreboard.html")) {
    loadTeamScoreboard();
  } else {
    loadPlayerScoreboard();
  }

});


// ======================================================
// LOAD PLAYER SCOREBOARD
// ======================================================

async function loadPlayerScoreboard() {

  const container = document.getElementById("scoreboardContainer");
  if (!container) return;

  // ----------------------------
  // Load elimination data
  // ----------------------------
  const contestantRes = await fetch("data/leaguecontestants.json?v=" + Date.now());
  const contestantData = await contestantRes.json();

  let eliminationMap = {};

  contestantData.teams?.forEach(team => {
    team.players?.forEach(player => {
      eliminationMap[player.name] = player.eliminatedAfter ?? null;
    });
  });

  // ----------------------------
  // Episode Files
  // ----------------------------
  const episodes = [
    "episode2.json",
    "episode3.json"
    // Add new episodes here
  ];

  let overallTotals = {};

  // ----------------------------
  // Loop Through Episodes
  // ----------------------------
  for (let file of episodes) {

    const episodeNumber = parseInt(
      file.replace("episode", "").replace(".json", "")
    );

    const response = await fetch(`data/${file}?v=${Date.now()}`);
    if (!response.ok) continue;

    const data = await response.json();

    const block = document.createElement("div");
    block.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = file.replace(".json", "").toUpperCase();
    block.appendChild(title);

    let rankings = [];

    for (let player in data.matrix) {

      // ----------------------------
      // ELIMINATION FILTER
      // ----------------------------
      const eliminatedAfter = eliminationMap[player];

      if (eliminatedAfter !== null && eliminatedAfter < episodeNumber) {
        continue;
      }

      const score = data.matrix[player].reduce((a, b) => a + b, 0);

      rankings.push({ name: player, score });

      overallTotals[player] =
        (overallTotals[player] || 0) + score;
    }

    rankings.sort((a, b) => b.score - a.score);

    rankings.forEach((p, index) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerText = `${index + 1}. ${p.name} - ${p.score}`;
      block.appendChild(row);
    });

    container.appendChild(block);
  }

  // ----------------------------
  // OVERALL RANKING
  // ----------------------------

  const overallBlock = document.createElement("div");
  overallBlock.className = "scoreboard-block";

  const overallTitle = document.createElement("h2");
  overallTitle.innerText = "OVERALL RANKING";
  overallBlock.appendChild(overallTitle);

  const overallArray = Object.entries(overallTotals)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  overallArray.forEach((p, index) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerText = `${index + 1}. ${p.name} - ${p.score}`;
    overallBlock.appendChild(row);
  });

  container.appendChild(overallBlock);
}


// ======================================================
// LOAD TEAM SCOREBOARD
// ======================================================

async function loadTeamScoreboard() {

  const params = new URLSearchParams(window.location.search);
  const leagueFile = params.get("league");

  if (!leagueFile) return;

  // ----------------------------
  // Load League Data
  // ----------------------------
  const leagueResponse = await fetch(`data/${leagueFile}.json?v=${Date.now()}`);
  const league = await leagueResponse.json();

  document.getElementById("teamScoreboardTitle").innerText =
    `${league.leagueName} Team Scoreboard`;

  const container = document.getElementById("teamScoreboardContainer");
  if (!container) return;

  // ----------------------------
  // Load Elimination Data
  // ----------------------------
  const contestantRes = await fetch("data/leaguecontestants.json?v=" + Date.now());
  const contestantData = await contestantRes.json();

  let eliminationMap = {};

  contestantData.teams?.forEach(team => {
    team.players?.forEach(player => {
      eliminationMap[player.name] = player.eliminatedAfter ?? null;
    });
  });

  // ----------------------------
  // Episode Files
  // ----------------------------
  const episodes = [
    "episode2.json",
    "episode3.json"
  ];

  let overallTotals = {};

  // ----------------------------
  // Loop Episodes
  // ----------------------------
  for (let file of episodes) {

    const episodeNumber = parseInt(
      file.replace("episode", "").replace(".json", "")
    );

    const episodeResponse = await fetch(`data/${file}?v=${Date.now()}`);
    if (!episodeResponse.ok) continue;

    const episodeData = await episodeResponse.json();

    const block = document.createElement("div");
    block.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = file.replace(".json", "").toUpperCase();
    block.appendChild(title);

    let rankings = [];

    for (let team of league.teams) {

      let teamScore = 0;

      for (let player of team.players) {

        const eliminatedAfter = eliminationMap[player.name];

        // ----------------------------
        // ELIMINATION FILTER
        // ----------------------------
        if (eliminatedAfter !== null && eliminatedAfter < episodeNumber) {
          continue;
        }

        const playerScores = episodeData.matrix[player.name];

        if (playerScores) {
          teamScore += playerScores.reduce((a, b) => a + b, 0);
        }
      }

      rankings.push({ name: team.teamName, score: teamScore });

      overallTotals[team.teamName] =
        (overallTotals[team.teamName] || 0) + teamScore;
    }

    rankings.sort((a, b) => b.score - a.score);

    rankings.forEach((t, index) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerText = `${index + 1}. ${t.name} - ${t.score}`;
      block.appendChild(row);
    });

    container.appendChild(block);
  }

  // ----------------------------
  // OVERALL TEAM RANKING
  // ----------------------------

  const overallBlock = document.createElement("div");
  overallBlock.className = "scoreboard-block";

  const overallTitle = document.createElement("h2");
  overallTitle.innerText = "OVERALL RANKING";
  overallBlock.appendChild(overallTitle);

  const overallArray = Object.entries(overallTotals)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  overallArray.forEach((t, index) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerText = `${index + 1}. ${t.name} - ${t.score}`;
    overallBlock.appendChild(row);
  });

  container.appendChild(overallBlock);
}
