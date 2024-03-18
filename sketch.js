let WIDTH = 600;
let HEIGHT = 600;

function setup() {
  createCanvas(WIDTH, HEIGHT);

  background(0);
  stroke(255);
  strokeWeight(10);

  // Import Class
  let convex = new ConvexHull();
  convex.generatePoints(10, WIDTH, HEIGHT);
  convex.showPoints();

  let edges = convex.KPS(convex.points);
  // console.log(edges);
  // for (let edge of edges) {
  //   stroke(255, 0, 0)
  //   point(edge.x, edge.y)
  // }
  // stroke(255, 0, 0)
  // point(edge.x, edge.y)
  // convex.showEdges(edges);
  // console.log(edges)
}
