// Get league from URL
const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (leagueFile) {
  fetch(`data/${leagueFile}.json`)
    .then(response => response.json())
    .then(data => renderLeague(data));
}

function renderLeague(data) {
  document.getElementById("leagueTitle").innerText = data.leagueName;

  const container = document.getElementById("teamsContainer");

  data.teams.forEach(team => {
    let totalScore = 0;

    const teamDiv = document.createElement("div");
    teamDiv.className = "team-card";

    const teamTitle = document.createElement("h2");
    teamTitle.innerText = team.teamName;
    teamDiv.appendChild(teamTitle);

    const playerList = document.createElement("ul");

    team.players.forEach(player => {
      totalScore += player.score;

      const li = document.createElement("li");
      li.innerHTML = `
        <span>${player.name}</span>
        <span class="score">${player.score} pts</span>
      `;
      playerList.appendChild(li);
    });

    teamDiv.appendChild(playerList);

    const total = document.createElement("div");
    total.className = "team-total";
    total.innerText = `Total: ${totalScore} pts`;

    teamDiv.appendChild(total);
    container.appendChild(teamDiv);
  });
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
