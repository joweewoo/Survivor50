async function loadEpisodes(maxEpisodes) {
  const episodes = [];

  for (let i = 1; i <= maxEpisodes; i++) {
    try {
      const response = await fetch(`episode${i}.json`);
      const data = await response.json();
      episodes.push(data);
    } catch (error) {
      break; // stop when no more episodes exist
    }
  }

  return episodes;
}

const params = new URLSearchParams(window.location.search);
const playerName = params.get("name");

document.getElementById("playerName").innerText = playerName;

let totalScore = 0;

async function loadData() {
  const container = document.getElementById("weeklyBreakdown");

  for (let file of episodes) {
    const response = await fetch(`data/${file}`);
    const data = await response.json();

    const episodeDiv = document.createElement("div");
    episodeDiv.innerHTML = `<h3>Episode ${data.episode}</h3>`;

    const playerArray = data.matrix[playerName];

    if (!playerArray) {
      episodeDiv.innerHTML += "<p>No data.</p>";
      container.appendChild(episodeDiv);
      continue;
    }

    const ul = document.createElement("ul");

    playerArray.forEach((points, index) => {
      if (points !== 0) {
        totalScore += points;

        const li = document.createElement("li");
        li.innerText = `${data.actions[index]} (+${points})`;
        ul.appendChild(li);
      }
    });

    if (ul.children.length === 0) {
      episodeDiv.innerHTML += "<p>No points this episode.</p>";
    } else {
      episodeDiv.appendChild(ul);
    }

    container.appendChild(episodeDiv);
  }

  document.getElementById("totalScore").innerText = totalScore;
}
loadData();
