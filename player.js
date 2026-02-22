// ==============================
// LOAD EPISODES DYNAMICALLY
// ==============================

async function loadEpisodes() {
  const episodes = [];
  let episodeNumber = 1;

  while (true) {
    try {
      const response = await fetch(`episode${episodeNumber}.json`);
      if (!response.ok) break;

      const data = await response.json();
      episodes.push(data);
      episodeNumber++;

    } catch (error) {
      break;
    }
  }

  return episodes;
}


// ==============================
// GET URL PARAMETERS
// ==============================

const params = new URLSearchParams(window.location.search);
const playerName = params.get("name");
const leagueFile = params.get("league"); // IMPORTANT

document.getElementById("playerName").innerText = playerName;


// ==============================
// LEAGUE RULES
// ==============================

const leagueRules = {
  "league1.json": { startEpisode: 1 },
  "league2.json": { startEpisode: 2 }
};

const startEpisode =
  leagueRules[leagueFile]?.startEpisode || 1;


// ==============================
// MAIN LOGIC
// ==============================

async function loadData() {

  const container = document.getElementById("weeklyBreakdown");
  const episodes = await loadEpisodes();

  let totalScore = 0;

  for (let episode of episodes) {

    const episodeNumber = episode.episode;

    const episodeDiv = document.createElement("div");
    episodeDiv.innerHTML = `<h3>Episode ${episodeNumber}</h3>`;

    const playerArray = episode.matrix[playerName];

    if (!playerArray) {
      episodeDiv.innerHTML += "<p>No data.</p>";
      container.appendChild(episodeDiv);
      continue;
    }

    const ul = document.createElement("ul");
    let episodeTotal = 0;

    playerArray.forEach((points, index) => {
      if (points !== 0) {
        episodeTotal += points;

        const li = document.createElement("li");
        li.innerText = `${episode.actions[index]} (+${points})`;
        ul.appendChild(li);
      }
    });

    if (ul.children.length === 0) {
      episodeDiv.innerHTML += "<p>No points this episode.</p>";
    } else {
      episodeDiv.appendChild(ul);
    }

    // Only count toward total if episode qualifies for this league
    if (episodeNumber >= startEpisode) {
      totalScore += episodeTotal;
    }

    container.appendChild(episodeDiv);
  }

  document.getElementById("totalScore").innerText = totalScore;
}


// ==============================
// RUN
// ==============================

loadData();
