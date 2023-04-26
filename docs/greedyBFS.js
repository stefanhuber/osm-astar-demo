function greedyBFS(startId, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));

  let qu = new PriorityQueue();
  qu.push(startId, 0);
  let previous = {};
  previous[startId] = null;

  let cn = 0;

  while (!qu.isEmpty()) {
    let currentId = qu.pop()["element"];
    cn += 1;
    if (currentId == goalId) {
      nodesVisited.textContent = `${cn} nodes visitedados`;
      return { previous: previous };
    }

    for (let neighbor of data[currentId].con) {
      let new_cost = euclideanDistance(
        data[currentId].lat,
        data[currentId].lon,
        data[goalId].lat,
        data[goalId].lon
      );

      if (!(neighbor in previous)) {
        let priority = new_cost;
        qu.push(neighbor, priority);
        previous[neighbor] = currentId;
      }
    }
  }
  return null;
}
