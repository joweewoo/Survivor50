window.addEventListener("DOMContentLoaded", () => {
  loadPlayerScoreboard();
});

async function loadPlayerScoreboard() {

  const container = document.getElementById("scoreboardContainer");

  // ==============================
  // LOAD ELIMINATION DATA
  // ==============================

  const contestantResponse = await fetch("data/leaguecontestants.json?v=" + Date.now());
  const contestantData = await contestantResponse.json();

  // Build elimination lookup
  let eliminationMap = {};

  if (contestantData.teams) {
    // If structure is team-based
    contestantData.teams.forEach(team => {
      team.players?.forEach(player => {
        eliminationMap[player.name] = player.eliminatedAfter || null;
      });
    });
  }

  // ==============================

  const episodes = [
    "episode2.json",
    "episode3.json"
  ];

  let overallTotals = {};

  for (let file of episodes) {

    const response = await fetch(`data/${file}?v=${Date.now()}`);
    const data = await response.json();

    const episodeNumber = parseInt(file.replace("episode", "").replace(".json",""));

    const episodeBlock = document.createElement("div");
    episodeBlock.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = file.replace(".json","").toUpperCase();
    episodeBlock.appendChild(title);

    let rankings = [];

    for (let player in data.matrix) {

      // ✅ FILTER OUT ELIMINATED PLAYERS
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
      episodeBlock.appendChild(row);
    });

    container.appendChild(episodeBlock);
  }

  // ==============================
  // OVERALL (NO FILTER)
  // ==============================

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

  // Overall Block
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

//TEAM Code
async function loadTeamScoreboard() {

  const params = new URLSearchParams(window.location.search);
  const leagueFile = params.get("league");

  if (!leagueFile) return;

  const leagueResponse = await fetch(`data/${leagueFile}.json?v=${Date.now()}`);
  const league = await leagueResponse.json();

  document.getElementById("teamScoreboardTitle").innerText =
    `${league.leagueName} Team Scoreboard`;

  const container = document.getElementById("teamScoreboardContainer");

  const episodes = [
    "episode2.json",
    "episode3.json"
  ];

  let overallTotals = {};

  for (let file of episodes) {

    const episodeResponse = await fetch(`data/${file}?v=${Date.now()}`);
    const episodeData = await episodeResponse.json();

    let rankings = [];

    for (let team of league.teams) {

      let teamScore = 0;

      for (let player of team.players) {

        const playerScores = episodeData.matrix[player.name];
        if (playerScores) {
          teamScore += playerScores.reduce((a,b)=>a+b,0);
        }
      }

      rankings.push({ name: team.teamName, score: teamScore });

      overallTotals[team.teamName] =
        (overallTotals[team.teamName] || 0) + teamScore;
    }

    rankings.sort((a,b)=>b.score-a.score);

    const block = document.createElement("div");
    block.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = file.replace(".json","").toUpperCase();
    block.appendChild(title);

    rankings.forEach((t,index)=>{
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerText = `${index+1}. ${t.name} - ${t.score}`;
      block.appendChild(row);
    });

    container.appendChild(block);
  }

  // Overall ranking block (same pattern as players)
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

if (window.location.pathname.includes("team-scoreboard.html")) {
  loadTeamScoreboard();
}
