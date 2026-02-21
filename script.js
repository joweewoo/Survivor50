// Get league from URL
const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (leagueFile) {
  fetch(`data/${leagueFile}.json`)
    .then(response => response.json())
    .then(data => renderLeague(data));
}

// Get league from URL
const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (leagueFile) {
  loadLeague(leagueFile);
}

async function loadLeague(fileName) {

  const response = await fetch(`data/${fileName}.json`);
  const league = await response.json();

  const container = document.querySelector(".league-list");

  container.innerHTML = `<h1>${league.leagueName}</h1>`;

  for (let team of league.teams) {

    const teamCard = document.createElement("div");
    teamCard.className = "team-card";

    teamCard.innerHTML = `<h2>${team.teamName}</h2>`;

    for (let player of team.players) {

      const score = await calculatePlayerScore(player.name);

      const playerDiv = document.createElement("div");

      playerDiv.innerHTML = `
        <a href="player.html?name=${player.name}">
          ${player.name}
        </a>
        <span class="score">${score}</span>
      `;

      teamCard.appendChild(playerDiv);
    }

    container.appendChild(teamCard);
  }
}

async function loadLeague() {
  const response = await fetch("data/leaguecontestants.json");
  const data = await response.json();

  const container = document.getElementById("leagueContainer");
  container.innerHTML = `<h2>${data.leagueName}</h2>`;

  data.teams.forEach(team => {
    const div = document.createElement("div");

    const link = document.createElement("a");
    link.href = `player.html?name=${team.teamName}`;
    link.innerText = team.teamName;

    div.appendChild(link);
    container.appendChild(div);
  });
}
async function calculatePlayerScore(playerName) {

  const episodes = ["episode2.json", "episode3.json"]; // add more later
  let total = 0;

  for (let file of episodes) {
    const response = await fetch(`data/${file}`);
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
