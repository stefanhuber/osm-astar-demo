function improved_dijkstra(startId, goalId) {
  let data = JSON.parse(localStorage.getItem("data"));
  console.log("Improved version");

  let qu = new PriorityQueue();
  qu.push(startId, 0);
  let previous = {};
  let cost_so_far = {};
  previous[startId] = null;
  cost_so_far[startId] = 0;
  let cn = 0;
  while (!qu.isEmpty()) {
    let currentId = qu.pop()["element"];
    cn += 1;
    if (currentId == goalId) {
      nodesVisited.textContent = `${cn} nodes visitedados`;
      //   console.log("Improved one returning");
      //   console.log({ previous: previous });
      return { previous: previous };
    }

    for (let neighbor of data[currentId].con) {
      let new_cost =
        cost_so_far[currentId] +
        distance(
          data[currentId].lat,
          data[currentId].lon,
          data[neighbor].lat,
          data[neighbor].lon
        );
      if (!(neighbor in cost_so_far) || new_cost < cost_so_far[neighbor]) {
        cost_so_far[neighbor] = new_cost;
        let priority = new_cost;
        qu.push(neighbor, priority);
        previous[neighbor] = currentId;
      }
    }
  }
  return null;
}

class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  push(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  pop() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}
