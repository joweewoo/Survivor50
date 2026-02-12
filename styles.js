console.log("Script is running");

const params = new URLSearchParams(window.location.search);
const leagueFile = params.get("league");

if (!leagueFile) {
  document.body.innerHTML = "<h2>No league specified.</h2>";
} else {
  fetch(`./data/${leagueFile}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error("League file not found");
      }
      return response.json();
    })
    .then(data => renderLeague(data))
    .catch(error => {
      document.body.innerHTML = `
        <h2>Error loading league.</h2>
        <p>${error.message}</p>
      `;
    });
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
