let WIDTH = 600;
let HEIGHT = 600;

function setup() {
    createCanvas(WIDTH, HEIGHT);
    
    // Config
    background(0);
    stroke(255);
    strokeWeight(4);
    
    // Import Class
    convex = new ConvexHull();
    convex.generatePoints(100, WIDTH, HEIGHT);
    convex.showPoints();

    edges = convex.slowConvexHull(convex.points);
    convex.showEdges(edges);
    console.log(edges)
  }
  