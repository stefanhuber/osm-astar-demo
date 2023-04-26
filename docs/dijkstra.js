function dijkstra(startId, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));

  let dist = {};
  let previous = {};
  let unvisited = new Set(Object.keys(data));
  let total_size = unvisited.size;

  for (let key in data) {
    dist[key] = Infinity;
    previous[key] = null;
  }
  dist[startId] = 0;

  while (unvisited.size > 0) {
    let currentId = getClosestNode(dist, unvisited);
    unvisited.delete(currentId);

    if (currentId == goalId) {
      nodesVisited.textContent = `${
        total_size - unvisited.size
      } nodes visitedados`;
      return { previous: previous };
    }

    for (let neighbor of data[currentId].con) {
      let alt =
        dist[currentId] +
        distance(
          data[currentId].lat,
          data[currentId].lon,
          data[neighbor].lat,
          data[neighbor].lon
        );

      if (alt < dist[neighbor]) {
        dist[neighbor] = alt;

        previous[neighbor] = currentId;
      }
    }
  }

  return null;
}
function getClosestNode(dist, unvisited) {
  let minDist = Infinity;
  let closestNode = null;

  for (let node of unvisited) {
    if (dist[node] < minDist) {
      minDist = dist[node];
      closestNode = node;
    }
  }

  return closestNode;
}
