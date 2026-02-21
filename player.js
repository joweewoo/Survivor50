const weeks = ["episode2.json"];

const params = new URLSearchParams(window.location.search);
const playerName = params.get("name");

document.getElementById("playerName").innerText = playerName;

let totalScore = 0;

async function loadData() {
  const container = document.getElementById("weeklyBreakdown");

  for (let file of weeks) {
    const response = await fetch(`data/${file}`);
    const data = await response.json();

    const weekDiv = document.createElement("div");
    weekDiv.innerHTML = `<h3>Episode ${data.week}</h3>`;

    const actions = data.scores[playerName];

    if (actions && actions.length > 0) {
      const ul = document.createElement("ul");

      actions.forEach(item => {
        totalScore += item.points;

        const li = document.createElement("li");
        li.innerText = `${item.action} (+${item.points})`;
        ul.appendChild(li);
      });

      weekDiv.appendChild(ul);
    } else {
      weekDiv.innerHTML += "<p>No points this episode.</p>";
    }

    container.appendChild(weekDiv);
  }

  document.getElementById("totalScore").innerText = totalScore;
}

loadData();
