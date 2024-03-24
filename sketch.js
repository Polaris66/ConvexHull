let WIDTH = 600;
let HEIGHT = 600;
let points = [];
let n = 100;
let generateButton;
let clearButton;
let randomlyInitializeButton;
let initialized = false;
let simIdx = 0;
let messageDiv;
let simulation;
let simulateButton;

const TYPE = Object.freeze({
  'MEDIAN': 0,
  'BRIDGE': 1,
  'ELIMINATE_l': 2,
  'ELIMINATE_r': 3,
  'HULL_1_j': 4,
  'HULL_1_k': 5,
  'HULL_2': 6
});

function setup() {
  let container = createDiv();
  container.style('display', 'flex');
  container.style('align-items', 'center');
  container.style('padding-top', '20px');
  container.style('margin-top', '10vh');
  container.style('justify-content', 'center');
  container.style('align-items', 'center');
  container.style('height', '80vh');
  createCanvas(WIDTH, HEIGHT).parent(container);


  background(0);
  stroke(255);
  strokeWeight(7);

  messageDiv = createDiv('');
  messageDiv.id('messageDiv');
  messageDiv.style('font-size', '20px');
  messageDiv.style('height', '50px');
  messageDiv.style('width', 'full');
  messageDiv.style('border', '2px solid black');

  generateButton = createButton('Generate Convex Hull');
  generateButton.position(20, 20);
  generateButton.mousePressed(generateConvexHull);

  randomlyInitializeButton = createButton('Randomly Initialize Points');
  randomlyInitializeButton.position(20, 80);
  randomlyInitializeButton.mousePressed(generatePoints);

  clearButton = createButton('Clear Canvas');
  clearButton.position(20, 50);
  clearButton.mousePressed(clearCanvas);


  simulateButton = createButton('Simulate');
  simulateButton.position(20, 110);
  simulateButton.mousePressed(runSimulationStep);
}

function mousePressed() {
  if (!initialized && mouseX >= 0 && mouseX < WIDTH && mouseY >= 0 && mouseY < HEIGHT) {
    let newPoint = createVector(mouseX, mouseY);
    points.push(newPoint);
    for (let i = 0; i < points.length; i++) {
      point(points[i].x, points[i].y);
    }
  }
}

function drawPoints(P){
  for (let i = 0; i < P.length; i++) {
    point(P[i].x, P[i].y);
  }
}

function runSimulationStep() {
  if (found && simulation && simulation.length > 0) {
    let instruction = simulation.shift(); // Get the first instruction from the simulation array
    console.log("====");
    strokeWeight(4);
    switch (instruction[0]) {
      case TYPE.MEDIAN:
        clearCanvas();
        stroke(0, 255, 0);
        // Draw Points
        if(instruction[4][0].x < 0){
          drawPoints(mirror(instruction[4]));
        } else {
          drawPoints(instruction[4]);
        }
        // Draw Median
        stroke(255, 0, 255);
        if(instruction[1] < 0){
          line(-1*instruction[1], 0, -1*instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Draw k, m
        strokeWeight(10);
        stroke(0, 255, 255);
        if(instruction[2].x < 0){
          line(-1*instruction[2].x, -1*instruction[2].y, -1*instruction[2].x, -1*instruction[2].y);
          line(-1*instruction[3].x, -1*instruction[3].y, -1*instruction[3].x, -1*instruction[3].y);
        } else {
          line(instruction[2].x, instruction[2].y, instruction[2].x, instruction[2].y);
          line(instruction[3].x, instruction[3].y, instruction[3].x, instruction[3].y);
        }
        
        strokeWeight(4);
        // Send Message
        sendMessage("Median (purple) of these points (green). The right-most and left-most points are in cyan.");
        setTimeout(runSimulationStep, 3000); 
        break;
      case TYPE.BRIDGE:
        stroke(255, 0, 0);
        if(instruction[5].x < 0){
          line(-1*instruction[5].x, -1*instruction[5].y, -1*instruction[6].x, -1*instruction[6].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[6].x, instruction[6].y);
        }
        sendMessage(instruction[7]);
        setTimeout(runSimulationStep, 3000); 
        break;
      case TYPE.ELIMINATE_l:
        clearCanvas();
        // Draw Points
        if(instruction[4][0].x < 0){
          drawPoints(mirror(instruction[4]));
        } else {
          drawPoints(instruction[4]);
        }
        sendMessage(instruction[7]);
        setTimeout(runSimulationStep, 3000);
        break;
      case TYPE.ELIMINATE_r:
        clearCanvas();
        if(instruction[4][0].x < 0){
          drawPoints(mirror(instruction[4]));
        } else {
          drawPoints(instruction[4]);
        }
        sendMessage(instruction[7]);
        setTimeout(runSimulationStep, 3000);
        break;
      case TYPE.HULL_1_j:
        clearCanvas();
        stroke(0, 255, 255);
        if(instruction[6].x < 0){
          line(-1*instruction[6].x, -1*instruction[6].y, -1*instruction[6].x, -1*instruction[6].y);
        } else {
          line(instruction[6].x, instruction[6].y, instruction[6].x, instruction[6].y);
        }
        sendMessage(instruction[7]);
        setTimeout(runSimulationStep, 3000); 
        break;
      case TYPE.HULL_1_k:
        clearCanvas();
        stroke(0, 255, 255);
        if(instruction[5].x < 0){
          line(-1*instruction[5].x, -1*instruction[5].y, -1*instruction[5].x, -1*instruction[5].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[5].x, instruction[5].y);
        }
        sendMessage(instruction[7]);
        setTimeout(runSimulationStep, 3000); 
        break;
      case TYPE.HULL_2:
        setTimeout(runSimulationStep, 3000); 
        break;
      default:
        sendMessage("Simulation ended or not initialized.");
        break;
    }
  } else {
    sendMessage("Simulation ended or not initialized.");
  }
}

function generateConvexHull() {
  if (points.length > 2) {
    let convex = new ConvexHull();
    convex.points = points.slice();
    strokeWeight(5);
    let edges = convex.KPS(points);
    simulation = convex.simulation;
    console.log(convex.simulation);
    stroke(255, 0, 0);
    for (let i = 0; i < edges.length - 1; i++) {
      line(edges[i].x, edges[i].y, edges[i + 1].x, edges[i + 1].y);
    }
    initialized = true;
    found = true;
    sendMessage("Convex hull generated successfully.");
  } else {
    sendMessage("At least 3 points are required to generate a convex hull.");
  }
}

function clearCanvas() {
  background(0);
  points = [];
  stroke(255, 255, 255);
  initialized = false;
  simIdx = 0;
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
  drawPoints(points)
  initialized = true;
  found = false;
  simIdx = 0;
}

function sendMessage(message){
  document.getElementById("messageDiv").innerHTML = message;
}

var sleepSetTimeout_ctrl;

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

function mirror(P) {
  let res = []
  for (let p of P) {
      res.push(createVector(-1 * p.x, -1 * p.y));
  }
  return res;
}