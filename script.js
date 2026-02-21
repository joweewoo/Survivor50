// ======================================================
// ROUTING
// ======================================================

const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (!leagueFile) {
  loadContestants();
} else {
  loadLeague(leagueFile);
}

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
        <a href="player.html?name=${player.name}">
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

  console.log("Loading contestants page");

  const container = document.getElementById("leagueContainer");

  if (!container) return;

  const response = await fetch("data/leaguecontestants.json");

  if (!response.ok) {
    console.error("Contestants file not found");
    return;
  }

  const data = await response.json();

  container.innerHTML = `<h2>${data.leagueName}</h2>`;

  data.teams.forEach(team => {

    const teamDiv = document.createElement("div");

    const link = document.createElement("a");
    link.href = `player.html?name=${team.teamName}`;
    link.innerText = team.teamName;

    teamDiv.appendChild(link);
    container.appendChild(teamDiv);
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
