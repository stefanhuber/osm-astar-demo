function nearestNeighbour(lat, lon) {
  let data = JSON.parse(localStorage.getItem("data"));
  let id = "";
  let gd = 99999999;

  for (let key in data) {
    let d = distance(lat, lon, data[key].lat, data[key].lon);

    if (d < gd) {
      gd = d;
      id = key;
    }
  }

  return {
    id: id,
    data: data[id],
    lat: data[id].lat,
    lng: data[id].lon,
  };
}

function astar(startId, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));
  let queue = [
    {
      id: startId,
      cost: distance(
        data[startId].lat,
        data[startId].lon,
        data[goalId].lat,
        data[goalId].lon
      ),
      path: 0,
      parent: null,
      lat: data[startId].lat,
      lon: data[startId].lon,
    },
  ];
  let visited = new Set();

  let iterations = 0;

  let nodes = Object.keys(data).length;

  let circles = [];

  while (true) {
    if (++iterations > nodes) {
      console.info("No path between the two selected nodes");
      removeDots(circles);
      return null;
    }

    let current = queue.shift();

    //adding Points that were visited to calculate the distance
    circles.push(
      L.circle([current.lat, current.lon], { color: "red", radius: 3 }).addTo(
        mymap
      )
    );

    if (current.id == goalId) {
      removeDots(circles);
      return current;
    } else {
      visited.add(current.id);
      let children = getChildren(current, goalId, data);

      let changedQueue = false;

      for (let child of children) {
        if (!visited.has(child.id)) {
          queue.push(child);
          changedQueue = true;
        }
      }

      if (queue.length > 0) {
        // Prevent queue sort if nothing changed
        // Not within the first 50 Iterations to not prevent a 'initial' sort
        if (!changedQueue && iterations > 50) continue;

        queue.sort((a, b) => {
          if (a.cost < b.cost) {
            return -1;
          } else if (a.cost > b.cost) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        return null;
      }
    }
  }
}

function constructPath(node) {
  let path = [];

  while (node) {
    path.push([node.lat, node.lon]);
    node = node.parent;
  }

  return path;
}

/**
 * Obtain the children of the parent node
 * @param {Object} parent
 * @param {int} goalId
 * @param {Object} data
 * @returns An array with all childrens for this the give node
 */
function getChildren(parent, goalId, data) {
  let children = [];
  for (let c of data[parent.id].con) {
    let path =
      parent.path + distance(parent.lat, parent.lon, data[c].lat, data[c].lon);

    children.push({
      id: c,
      lat: data[c].lat,
      lon: data[c].lon,
      parent: parent,
      cost:
        path +
        distance(data[c].lat, data[c].lon, data[goalId].lat, data[goalId].lon),
      path: path,
    });
  }
  return children;
}

/**
 * Calculate the heuristic distance from positio A to Positio B
 * @param {double} lat1
 * @param {double} lon1
 * @param {double} lat2
 * @param {double} lon2
 * @returns
 */
function distance(lat1, lon1, lat2, lon2) {
  const heuristic = localStorage.getItem("heuristic") || "euclidean";

  switch (heuristic) {
    case "manhattan":
      return manhattanDistance(lat1, lon1, lat2, lon2);
    case "zero":
      return 0;
    case "cube":
      return Math.pow(euclideanDistance(lat1, lon1, lat2, lon2), 3);
    case "sometimegreater":
      return (Math.random() + 1) * euclideanDistance(lat1, lon1, lat2, lon2);
    case "euclidean":
      return euclideanDistance(lat1, lon1, lat2, lon2);
    default:
      return euclideanDistance(lat1, lon1, lat2, lon2);
  }
}

/**
 * Remove Dots Created on this implementation
 * @param {array} circles
 */
function removeDots(circles) {
  nodesVisited.textContent = `${circles.length} nodes visited`;
  setTimeout(() => {
    for (let circle of circles) {
      mymap.removeLayer(circle);
    }
  }, 3000);
}

function euclideanDistance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
}

function manhattanDistance(lat1, lon1, lat2, lon2) {
  let d1 = Math.abs(lat1 - lat2);
  let d2 = Math.abs(lon1 - lon2);
  return d1 + d2;
}

// function diagonalDistance(lat1, lon1, lat2, lon2) {
//   let dLat = Math.abs(lat2 - lat1);
//   let dLon = Math.abs(lon2 - lon1);
//   return dLat + dLon + (Math.sqrt(2) - 2) * Math.min(dLat, dLon);
// }

// function octileDistance(lat1, lon1, lat2, lon2) {
//   let dLat = Math.abs(lat2 - lat1);
//   let dLon = Math.abs(lon2 - lon1);
//   let D = 1;
//   let D2 = Math.sqrt(2);
//   return D * (dLat + dLon) + (D2 - 2 * D) * Math.min(dLat, dLon);
// }
