// ======================================================
// ROUTING
// ======================================================

window.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const leagueFile = params.get("league");

  if (!leagueFile) {
    loadContestants();
  } else {
    loadLeague(leagueFile);
  }

});
// ======================================================
// LOAD LEAGUE PAGE (High School / Family / etc)
// ======================================================

async function loadLeague(fileName) {

  console.log("Loading league:", fileName);

  const response = await fetch(`data/${fileName}.json`);

  if (!response.ok) {
    console.error("League file not found:", fileName);
    return;
  }

  const league = await response.json();

  const title = document.getElementById("leagueTitle");
  const container = document.getElementById("teamsContainer");

  if (!title || !container) return;

  title.innerText = league.leagueName;
  container.innerHTML = "";

  // =========================================
  // ADD TEAM SCOREBOARD LINK
  // =========================================

  // Remove existing button if reloaded
  const existingButton = document.getElementById("teamScoreboardBtn");
  if (existingButton) existingButton.remove();

  const scoreboardLink = document.createElement("a");
  scoreboardLink.id = "teamScoreboardBtn";
  scoreboardLink.href = `team-scoreboard.html?league=${fileName}`;
  scoreboardLink.className = "league-button";
  scoreboardLink.innerText = "Team Scoreboard";

  // Insert AFTER title
  title.insertAdjacentElement("afterend", scoreboardLink);

  // =========================================
  // RENDER TEAMS
  // =========================================

  for (let team of league.teams) {

    let teamTotal = 0;

    const teamDiv = document.createElement("div");
    teamDiv.className = "team-card";

    const teamHeader = document.createElement("h2");
    teamHeader.innerText = team.teamName;
    teamDiv.appendChild(teamHeader);

    const playerList = document.createElement("ul");

    for (let player of team.players) {

      const score = await calculatePlayerScore(player.name);
      teamTotal += score;

      const li = document.createElement("li");

      li.innerHTML = `
        <a class="player-link" href="player.html?name=${player.name}">
          ${player.name}
        </a>
        <span class="score">${score} pts</span>
      `;

      playerList.appendChild(li);
    }

    teamDiv.appendChild(playerList);

    const totalDiv = document.createElement("div");
    totalDiv.className = "team-total";
    totalDiv.innerText = `Team Total: ${teamTotal} pts`;

    teamDiv.appendChild(totalDiv);

    container.appendChild(teamDiv);
  }
}
// ======================================================
// LOAD CONTESTANTS PAGE
// ======================================================

async function loadContestants() {

  const container = document.getElementById("leagueContainer");
  if (!container) return;

  const response = await fetch("data/leaguecontestants.json?v=" + Date.now());
  if (!response.ok) {
    console.error("Contestants file not found");
    return;
  }

  const data = await response.json();

  container.innerHTML = "";

  const header = document.createElement("h1");
  header.className = "league-header";
  header.innerText = data.leagueName;
  container.appendChild(header);

  data.teams.forEach(team => {

    const card = document.createElement("div");
    card.className = "team-card";

    const link = document.createElement("a");
    link.className = "player-link";
    link.href = `player.html?name=${team.teamName}`;
    link.innerText = team.teamName;

    card.appendChild(link);
    container.appendChild(card);

  });
}

// ======================================================
// CALCULATE PLAYER SCORE FROM EPISODE MATRICES
// ======================================================

async function calculatePlayerScore(playerName) {

  const episodes = [
    "episode2.json",
    "episode3.json"
    // Add new episodes here
  ];

  let total = 0;

  for (let file of episodes) {

    const response = await fetch(`data/${file}`);
    if (!response.ok) continue;

    const data = await response.json();

    const playerArray = data.matrix[playerName];

    if (playerArray) {
      playerArray.forEach(points => {
        total += points;
      });
    }
  }

  return total;
}
