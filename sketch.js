let WIDTH = 600;
let HEIGHT = 600;
let points = [];
let n = 50;
let generateButton;
let clearButton;
let randomlyInitializeButton;

let randomlyInitialize = false;

function setup() {
  let container = createDiv();
  container.style('display', 'flex');
  container.style('padding', '20px');
  container.style('justify-content', 'center');
  container.style('align-items', 'center');
  container.style('height', '100vh');
  createCanvas(WIDTH, HEIGHT).parent(container);

  background(0);
  stroke(255);
  strokeWeight(7);

  generateButton = createButton('Generate Convex Hull');
  generateButton.position(20, 20);
  generateButton.mousePressed(generateConvexHull);

  randomlyInitializeButton = createButton('Randomly Initialize Points');
  randomlyInitializeButton.position(20, 80);
  randomlyInitializeButton.mousePressed(generatePoints);

  clearButton = createButton('Clear Canvas');
  clearButton.position(20, 50);
  clearButton.mousePressed(clearCanvas);
}

function mousePressed() {
  if (!randomlyInitialize && mouseX >= 0 && mouseX < WIDTH && mouseY >= 0 && mouseY < HEIGHT) {
    let newPoint = createVector(mouseX, mouseY);
    points.push(newPoint);
    for (let i = 0; i < points.length; i++) {
      point(points[i].x, points[i].y);
    }
  }
}

function generateConvexHull() {
  if (points.length > 2) {
    let convex = new ConvexHull();
    convex.points = points.slice();
    strokeWeight(5);
    let edges = convex.KPS(points);
    stroke(255, 0, 0);
    for (let i = 0; i < edges.length - 1; i++) {
      line(edges[i].x, edges[i].y, edges[i + 1].x, edges[i + 1].y);
    }
  }
  randomlyInitialize = false;
}

function clearCanvas() {
  background(0);
  points = [];
  stroke(255, 255, 255);
}

function generatePoints() {
  clearCanvas();
  randomlyInitialize = true;
  points = [];
  let w = WIDTH;
  let h = HEIGHT;
  for (let i = 0; i < n; i++) {
      points.push(createVector(w / 8 + random() * (3 * w / 4), h / 8 + random() * (3 * h / 4)));
  }
  for (let i = 0; i < points.length; i++) {
    point(points[i].x, points[i].y);
  }
}
