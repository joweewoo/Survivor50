// ======================================================
//  ROUTING — LOAD CORRECT LEAGUE FROM URL
// ======================================================

const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (leagueFile) {
  loadLeague(leagueFile);
}

// ======================================================
//  LOAD LEAGUE + AUTO CALCULATE SCORES
// ======================================================

async function loadLeague(fileName) {

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
  container.innerHTML = ""; // Clear old content

  // Loop through teams
  for (let team of league.teams) {

    let teamTotal = 0;

    const teamDiv = document.createElement("div");
    teamDiv.className = "team-card";

    // Team Name
    const teamHeader = document.createElement("h2");
    teamHeader.innerText = team.teamName;
    teamDiv.appendChild(teamHeader);

    const playerList = document.createElement("ul");

    // Loop through players
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

    // Team Total
    const totalDiv = document.createElement("div");
    totalDiv.className = "team-total";
    totalDiv.innerText = `Team Total: ${teamTotal} pts`;

    teamDiv.appendChild(totalDiv);

    container.appendChild(teamDiv);
  }
}

// ======================================================
//  CALCULATE PLAYER SCORE FROM EPISODE MATRICES
// ======================================================

async function calculatePlayerScore(playerName) {

  const episodes = [
    "episode2.json",
    "episode3.json"
    // Add new episode files here
  ];

  let total = 0;

  // Fetch ALL episodes
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
