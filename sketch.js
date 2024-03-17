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
    convex.showPoints(convex.points);

    // edges = convex.slowConvexHull(convex.points);
    // convex.showEdges(edges);
    // console.log(edges);
    strokeWeight(20);
    stroke(0, 255, 0);
    hull = convex.jarvisAlgorithm(convex.points);
    edges = convex.points2Edges(hull);
    console.log(edges)
    convex.showEdges(edges);
    
    convex.showPoints(convex.points);
  

  }
