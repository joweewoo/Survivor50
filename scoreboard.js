window.addEventListener("DOMContentLoaded", () => {
  loadPlayerScoreboard();
});

async function loadPlayerScoreboard() {

  const container = document.getElementById("scoreboardContainer");

  const episodes = [
    "episode2.json",
    "episode3.json"
  ];

  let overallTotals = {};

  for (let file of episodes) {

    const response = await fetch(`data/${file}?v=${Date.now()}`);
    const data = await response.json();

    const episodeBlock = document.createElement("div");
    episodeBlock.className = "scoreboard-block";

    const title = document.createElement("h2");
    title.innerText = file.replace(".json", "").toUpperCase();
    episodeBlock.appendChild(title);

    let rankings = [];

    for (let player in data.matrix) {

      const score = data.matrix[player].reduce((a, b) => a + b, 0);

      rankings.push({ name: player, score });

      // Add to overall
      overallTotals[player] = (overallTotals[player] || 0) + score;
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
