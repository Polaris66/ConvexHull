let WIDTH = 600;
let HEIGHT = 600;

function setup() {
  createCanvas(WIDTH, HEIGHT);

  background(0);
  stroke(255);
  strokeWeight(7);

  // Import Class
  let convex = new ConvexHull();
  convex.generatePoints(500, WIDTH, HEIGHT);
  convex.showPoints();
  strokeWeight(5);
  let edges = convex.KPS(convex.points);
  stroke(255, 0, 0)
  for(let i = 0; i < edges.length - 1; i++){
    line(edges[i].x, edges[i].y, edges[i+1].x, edges[i+1].y);
  }
}
