// ======================================================
// PLAYER SCOREBOARD (LEAGUE-SPECIFIC)
// ======================================================

window.addEventListener("DOMContentLoaded", () => {
  loadLeaguePlayerScoreboard();
});

async function loadLeaguePlayerScoreboard() {

  const params = new URLSearchParams(window.location.search);
  const leagueFile = params.get("league");

  if (!leagueFile) {
    console.error("No league specified in URL");
    return;
  }

  const container = document.getElementById("scoreboardContainer");
  if (!container) return;

  // Clear container
  container.innerHTML = "";

  // ----------------------------
  // Get League Rules (Start Episode)
  // ----------------------------

  const leagueRules = {
    "league1": 1,
    "league2": 2
  };

  const startEpisode = leagueRules[leagueFile] || 1;

  // ----------------------------
  // Load Elimination Data
  // ----------------------------

  const contestantRes = await fetch("data/leaguecontestants.json?v=" + Date.now());
  const contestantData = await contestantRes.json();

  let eliminationMap = {};

  contestantData.teams?.forEach(team => {
    eliminationMap[team.teamName] = team.eliminatedAfter ?? null;
  });

  // ----------------------------
  // Load Episodes Dynamically
  // ----------------------------

  let episodes = [];
  let episodeNumber = 1;

  while (true) {

    const res = await fetch(`data/episode${episodeNumber}.json?v=${Date.now()}`);
    if (!res.ok) break;

    const data = await res.json();
    episodes.push(data);

    episodeNumber++;
  }

  let overallTotals = {};

  // ----------------------------
  // Render Episodes
  // ----------------------------

  for (let episode of episodes) {

    if (episode.episode < startEpisode) continue;

    const block = document.createElement("div");
    block.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = `EPISODE ${episode.episode}`;
    block.appendChild(title);

    let rankings = [];

    for (let player in episode.matrix) {

      const eliminatedAfter = eliminationMap[player];

      if (eliminatedAfter !== null &&
          eliminatedAfter < episode.episode) {
        continue;
      }

      const score = episode.matrix[player]
        .reduce((a, b) => a + b, 0);

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
  // Overall Block
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
