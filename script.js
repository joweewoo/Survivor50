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
// LEAGUE RULES
// ======================================================

const leagueRules = {
  "league1": { startEpisode: 1 }, // High School Friends
  "league2": { startEpisode: 2 }  // Family League
};


// ======================================================
// LOAD LEAGUE PAGE
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

  // Determine startEpisode for this league
  const startEpisode =
    leagueRules[fileName]?.startEpisode || 1;


  // =========================================
  // PLAYER SCOREBOARD LINK
  // =========================================

  const playerLink = document.createElement("a");
  playerLink.href = `league-player-scoreboard.html?league=${fileName}`;
  playerLink.className = "player-link";
  playerLink.innerText = "Player Scoreboard";

  title.insertAdjacentElement("afterend", playerLink);


  // =========================================
  // TEAM SCOREBOARD LINK
  // =========================================

  const scoreboardLink = document.createElement("a");
  scoreboardLink.href = `team-scoreboard.html?league=${fileName}`;
  scoreboardLink.className = "player-link";
  scoreboardLink.innerText = "Team Scoreboard";

  playerLink.insertAdjacentElement("afterend", scoreboardLink);


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

      const score = await calculatePlayerScore(player.name, startEpisode);
      teamTotal += score;

      const li = document.createElement("li");

      li.innerHTML = `
        <a class="scoreboard-player-link"
           href="player.html?name=${player.name}&league=${fileName}">
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
    link.className = "scoreboard-player-link";
    link.href = `league.html?league=${team.file}`;
    link.innerText = team.teamName;

    card.appendChild(link);
    container.appendChild(card);

  });
}


// ======================================================
// LOAD EPISODES DYNAMICALLY
// ======================================================

async function loadEpisodes() {

  const episodes = [];
  let episodeNumber = 1;

  while (true) {
    try {
      const response = await fetch(`data/episode${episodeNumber}.json`);
      if (!response.ok) break;

      const data = await response.json();
      episodes.push(data);
      episodeNumber++;

    } catch {
      break;
    }
  }

  return episodes;
}


// ======================================================
// CALCULATE PLAYER SCORE
// ======================================================

async function calculatePlayerScore(playerName, startEpisode) {

  const episodes = await loadEpisodes();
  let total = 0;

  for (let episode of episodes) {

    if (episode.episode < startEpisode) continue;

    const playerArray = episode.matrix[playerName];

    if (playerArray) {
      playerArray.forEach(points => {
        total += points;
      });
    }
  }

  return total;
}
