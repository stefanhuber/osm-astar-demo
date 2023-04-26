let selectedAlgorithm = "astar";

let ab = true;
let aid = -1;
let bid = -1;
const mymap = L.map("mapid").setView(
  [49.282416676923065, -123.12200205769232],
  15
);
const line = L.polyline([], { color: "black", weight: 10 }).addTo(mymap);
const a = L.marker([0, 0]).addTo(mymap);
const b = L.marker([1, 1]).addTo(mymap);
const nodes = document.getElementById("nodes");
const nodesVisited = document.getElementById("visited-nodes");
const perform = document.getElementById("performance");

mymap.setMaxBounds([
  [48.1644, -120.1457],
  [49.6033, -123.1898],
]);

L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "",
  maxZoom: 17,
  subdomains: "abc",
}).addTo(mymap);

fetch("map.json")
  .then((response) => response.json())
  .then((data) => {
    localStorage.setItem("data", JSON.stringify(data.nodes));

    let l = 0;
    for (let k in data.nodes) l++;

    nodes.textContent = `${l} nodes in the map`;
  });

//Select buttons
const astarButton = document.getElementById("astar-btn");
const dijkstraButton = document.getElementById("dijkstra-btn");
const idijkstraButton = document.getElementById("idijkstra-btn");
const gbfsButton = document.getElementById("gbfs-btn");

//Attach Event listener
astarButton.addEventListener("click", () => {
  selectedAlgorithm = "astar";
  showActive(astarButton, dijkstraButton, idijkstraButton, gbfsButton);
  heuristicSelect.style.display = "inline-block";
  recalculateRoute();
});

dijkstraButton.addEventListener("click", () => {
  selectedAlgorithm = "dijkstra";
  showActive(dijkstraButton, astarButton, idijkstraButton, gbfsButton);
  heuristicSelect.style.display = "none";
  recalculateRoute();
});

idijkstraButton.addEventListener("click", () => {
  selectedAlgorithm = "idijkstra";
  showActive(idijkstraButton, dijkstraButton, astarButton, gbfsButton);
  heuristicSelect.style.display = "none";
  recalculateRoute();
});

gbfsButton.addEventListener("click", () => {
  selectedAlgorithm = "gbfs";
  showActive(gbfsButton, idijkstraButton, dijkstraButton, astarButton);
  heuristicSelect.style.display = "none";
  recalculateRoute();
});

function showActive(active, inactive, inactive2, inactive3) {
  active.classList.add("active");
  inactive.classList.remove("active");
  inactive2.classList.remove("active");
  inactive3.classList.remove("active");
}

mymap.on("click", (e) => {
  let nn = nearestNeighbour(e.latlng["lat"], e.latlng["lng"]);

  if (ab) {
    a.setLatLng([nn.lat, nn.lng]);
    aid = nn.id;
    ab = false;
  } else {
    b.setLatLng([nn.lat, nn.lng]);
    bid = nn.id;
    ab = true;
  }
  recalculateRoute();
});

let traversedNodeCircles = [];

function displayTraversedNodes(traversedNodes, duration) {
  let data = JSON.parse(localStorage.getItem("data"));

  // Remove any existing traversed node circles before displaying new ones
  for (let circle of traversedNodeCircles) {
    mymap.removeLayer(circle);
  }

  // Clear the array
  traversedNodeCircles = [];

  for (let nodeId of traversedNodes) {
    if (data[nodeId]) {
      let nodeCircle = L.circle([data[nodeId].lat, data[nodeId].lon], {
        radius: 1,
        color: "red",
      }).addTo(mymap);
      traversedNodeCircles.push(nodeCircle);
    }
  }

  setTimeout(() => {
    for (let circle of traversedNodeCircles) {
      mymap.removeLayer(circle);
    }
  }, duration);
}

function constructPathAstar(result, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));
  let path = [];
  let currentNode = result;

  while (currentNode) {
    if (data[currentNode.id]) {
      path.unshift([data[currentNode.id].lat, data[currentNode.id].lon]);
    }
    currentNode = currentNode.parent;
  }

  console.log("Constructed path (A*):", path);
  return path;
}
function constructPath(previous, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));
  let path = [];
  let currentNode = goalId;

  while (currentNode) {
    if (data[currentNode]) {
      path.unshift([data[currentNode].lat, data[currentNode].lon]);
    }

    if (
      previous[currentNode] &&
      previous[currentNode].hasOwnProperty("parent")
    ) {
      currentNode = previous[currentNode].parent
        ? previous[currentNode].parent.id
        : null;
    } else {
      currentNode = previous[currentNode];
    }
  }

  console.log("Constructed path:", path);
  return path;
}

//IIFE To display the buttons.
(() => {
  let data = JSON.parse(localStorage.getItem("data"));

  let circles = [];
  for (let key in data) {
    if (data.hasOwnProperty(key))
      circles.push(L.circle([data[key].lat, data[key].lon], { radius: 1 }));
  }

  // Put all Nodes (circles) into a Layer, so the 13.000 circles do not have to be removed and created on every button click
  let circlesLayer = L.layerGroup(circles);

  document.getElementById("toggle-nodes").addEventListener("click", () => {
    if (mymap.hasLayer(circlesLayer)) {
      mymap.removeLayer(circlesLayer);
    } else {
      mymap.addLayer(circlesLayer);
    }
  });
})();
const heuristicSelect = document.getElementById("heuristic-select");
heuristicSelect.addEventListener("change", (e) => {
  localStorage.setItem("heuristic", e.target.value);
  recalculateRoute();
});

function recalculateRoute() {
  if (aid > 0 && bid > 0) {
    let result;
    const start = performance.now();
    if (selectedAlgorithm === "astar") {
      result = astar(aid, bid);
    } else if (selectedAlgorithm === "dijkstra") {
      result = dijkstra(aid, bid);
    } else if (selectedAlgorithm === "gbfs") {
      result = greedyBFS(aid, bid); //improved_dijkstra(aid, bid); //
    } else {
      result = improved_dijkstra(aid, bid);
    }
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
    perform.textContent = `Execution time: ${end - start} ms`;

    if (result) {
      let path;
      let traversedNodes;

      if (selectedAlgorithm === "astar") {
        path = constructPathAstar(result.parent, bid);
        traversedNodes = Object.keys(result.parent).filter(
          (nodeId) => result.parent[nodeId] !== null
        );
      } else {
        path = constructPath(result.previous, bid);
        traversedNodes = Object.keys(result.previous).filter(
          (nodeId) => result.previous[nodeId] !== null
        );
      }

      line.setLatLngs(path);
      displayTraversedNodes(traversedNodes, 3000); // Display traversed nodes for 3 seconds
    }
  }
}
