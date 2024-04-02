let WIDTH = 600;
let HEIGHT = 600;
let points = [];
let n = 200;
let generateButton;
let clearButton;
let randomlyInitializeButton;
let initialized = false;
let simIdx = 0;
let messageDiv;
let simulation;
let simulateButton;
let numberPointsTextBox;
let numberPoints;
let defaultPoints = '10';
let TIMEOUT = 1000;

let algo = 2;
let found = false;

const ALGORITHM = Object.freeze({
  'BRUTE': 0,
  'KPS': 1,
  'JARVIS': 2,
});


const BRUTE_TYPE = Object.freeze({
  'LINE': 0,
  'TEST': 1,
});

const TYPE = Object.freeze({
  'MEDIAN': 0,
  'BRIDGE': 1,
  'ELIMINATE_l': 2,
  'ELIMINATE_r': 3,
  'HULL_1_j': 4,
  'HULL_1_k': 5,
  'HULL_2': 6,
  'J_LEFTMOST': 7,
  'J_CHOOSEQ': 8,
  'J_ACCEPTORIENTATION': 9,
  'J_REJECTORIENTATION': 10,
  'J_UPDATE_HULL': 11,
  'BF_GET_PAIR': 12,
  'BF_CHECKPOINT': 13,
  'BF_UPDATE_HULL': 14,
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

  numberPointsTextBox = createInput(defaultPoints);
  numberPointsTextBox.position(20, 140);
  numberPointsTextBox.id('numberPointsTextBox');
  numberPointsTextBox.attribute('type', 'number');
  numberPointsTextBox.attribute('placeholder', 'Enter number of points');

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


  simulateButton = createButton('Visualize');
  simulateButton.position(20, 110);
  simulateButton.mousePressed(runSimulationStep);

  simulateButton = createButton('Brute Force');
  simulateButton.position(20, 170);
  simulateButton.mousePressed(toggleBrute);

  simulateButton = createButton('Kirk Seidal Algorithm');
  simulateButton.position(20, 200);
  simulateButton.mousePressed(toggleKPS);

  simulateButton = createButton('Jarvis Algorithm');
  simulateButton.position(20, 230);
  simulateButton.mousePressed(toggleJarvis);
}

function toggleBrute() {
  algo = ALGORITHM.BRUTE
  console.log(algo);
}
function toggleKPS() {
  algo = ALGORITHM.KPS
  console.log(algo)
}
function toggleJarvis() {
  algo = ALGORITHM.JARVIS
  console.log(algo)
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

function drawPoints(P) {
  for (let i = 0; i < P.length; i++) {
    point(P[i].x, P[i].y);
  }
}
function runBruteStep() {
  if (found && simulation && simulation.length > 0) {
    let instruction = simulation.shift();
    strokeWeight(4);
    clearCanvas();
    stroke(255);
    console.log("instruction");
    console.log(instruction);
    switch (instruction[0]) {
      case TYPE.BF_GET_PAIR:
        console.log("reached here!");
        stroke(255, 255, 255);
        drawPoints(instruction[2]);
        stroke(255, 255, 0);
        for (let e of instruction[1]) {
          line(e[0].x, e[0].y, e[1].x, e[1].y);
        }
        stroke(162, 32, 240);
        line(instruction[3].x, instruction[3].y, instruction[4].x, instruction[4].y);
        sendMessage("We take a pair of points (purple).");
        stroke(255);
        setTimeout(runSimulationStep, 1000);
        console.log("found pair. Now updating...");
        break;
      case TYPE.BF_UPDATE_HULL:
        console.log("in Update...");
        stroke(255, 255, 255);
        drawPoints(instruction[2]);
        stroke(255, 255, 0);
        for (let e of instruction[1]) {
          line(e[0].x, e[0].y, e[1].x, e[1].y);
        }
        sendMessage("We add this pair to the hull.");
        stroke(255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BF_CHECKPOINT:
        console.log("in Update...");
        stroke(255, 255, 255);
        drawPoints(instruction[2]);
        stroke(255, 255, 0);
        for (let e of instruction[1]) {
          line(e[0].x, e[0].y, e[1].x, e[1].y);
        }
        stroke(162, 32, 240);
        line(instruction[3].x, instruction[3].y, instruction[4].x, instruction[4].y);
        stroke(0, 0, 255);
        line(instruction[5].x, instruction[5].y, instruction[5].x, instruction[5].y);
        sendMessage("The current point we are considering (green).");
        stroke(255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      default:
        sendMessage("Simulation ended or not initialized.");
        break;
    }
  }
}

function runJarvisStep() {
  if (found && simulation && simulation.length > 0) {
    let instruction = simulation.shift(); // Get the first instruction from the simulation array
    console.log("====");
    strokeWeight(4);
    clearCanvas();
    stroke(255);
    switch (instruction[0]) {
      case TYPE.J_LEFTMOST:
        drawPoints(instruction[3]);
        stroke(0, 255, 0);
        drawPoints([instruction[2]]);
        sendMessage("We start with the left-most point of the set (Green). This is now our current point. Also, note that this point must belong to the Hull.");
        stroke(255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.J_ACCEPTORIENTATION:
        stroke(255);
        drawPoints(instruction[5]);
        stroke(160, 32, 240);
        strokeWeight(2);
        line(instruction[4].x, instruction[4].y, instruction[3].x, instruction[3].y);
        line(instruction[2].x, instruction[2].y, instruction[3].x, instruction[3].y);
        strokeWeight(4);
        stroke(255, 255, 255);
        sendMessage("This orientation can be accepted.");
        stroke(0, 0, 255);
        drawPoints([instruction[3]]);
        stroke(0, 255, 0);
        drawPoints([instruction[2]]);
        stroke(255, 255, 0);
        for (let idx = 0; idx < instruction[1].length - 1; idx++) {
          line(instruction[1][idx].x, instruction[1][idx].y, instruction[1][idx + 1].x, instruction[1][idx + 1].y);
        }
        stroke(255, 255, 255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.J_REJECTORIENTATION:
        stroke(255);
        drawPoints(instruction[5]);
        stroke(160, 32, 240);
        strokeWeight(2);
        line(instruction[4].x, instruction[4].y, instruction[3].x, instruction[3].y);
        line(instruction[2].x, instruction[2].y, instruction[3].x, instruction[3].y);
        strokeWeight(4);
        stroke(255, 255, 255);
        sendMessage("We Update Q now.");
        stroke(0, 0, 255);
        drawPoints([instruction[3]]);
        stroke(0, 255, 0);
        drawPoints([instruction[2]]);
        stroke(255, 255, 0);
        for (let idx = 0; idx < instruction[1].length - 1; idx++) {
          line(instruction[1][idx].x, instruction[1][idx].y, instruction[1][idx + 1].x, instruction[1][idx + 1].y);
        }
        stroke(255, 255, 255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.J_UPDATE_HULL:
        stroke(255);
        drawPoints(instruction[5]);
        stroke(160, 32, 240);
        strokeWeight(2);
        line(instruction[4].x, instruction[4].y, instruction[3].x, instruction[3].y);
        line(instruction[2].x, instruction[2].y, instruction[3].x, instruction[3].y);
        strokeWeight(4);
        stroke(255, 255, 255);
        sendMessage("We add the  current point to the Hull as the orientation condition is satisfied and move on to the next point.");
        stroke(0, 0, 255);
        drawPoints([instruction[3]]);
        stroke(0, 255, 0);
        drawPoints([instruction[2]]);
        stroke(255, 255, 0);
        for (let idx = 0; idx < instruction[1].length - 1; idx++) {
          line(instruction[1][idx].x, instruction[1][idx].y, instruction[1][idx + 1].x, instruction[1][idx + 1].y);
        }
        stroke(255, 255, 255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.J_CHOOSEQ:
        stroke(255);
        drawPoints(instruction[5]);
        stroke(160, 32, 240);
        strokeWeight(2);
        line(instruction[4].x, instruction[4].y, instruction[3].x, instruction[3].y);
        line(instruction[2].x, instruction[2].y, instruction[3].x, instruction[3].y);
        strokeWeight(4);
        stroke(255, 255, 255);
        sendMessage("We need to find a point q (BLUE) such that the orientation of the current point (GREEN), q and every other point is positive.");
        stroke(0, 0, 255);
        drawPoints([instruction[3]]);
        stroke(0, 255, 0);
        drawPoints([instruction[2]]);
        stroke(255, 255, 0);
        for (let idx = 0; idx < instruction[1].length - 1; idx++) {
          line(instruction[1][idx].x, instruction[1][idx].y, instruction[1][idx + 1].x, instruction[1][idx + 1].y);
        }
        stroke(255, 255, 255);
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      default:
        sendMessage("Simulation ended or not initialized.");
        break;
    }
  }
}

function runKPSStep() {
  if (found && simulation && simulation.length > 0) {
    let instruction = simulation.shift(); // Get the first instruction from the simulation array
    console.log("====");
    strokeWeight(4);
    switch (instruction[0]) {
      case TYPE.MEDIAN:
        clearCanvas();
        stroke(0, 255, 0);
        // Draw Points
        if (instruction[4][0].x < 0) {
          drawPoints(mirror(instruction[4]));
        } else {
          drawPoints(instruction[4]);
        }
        // Draw Median
        stroke(255, 0, 255);
        if (instruction[1] < 0) {
          line(-1 * instruction[1], 0, -1 * instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Draw k, m
        strokeWeight(10);
        stroke(0, 255, 255);
        if (instruction[2].x < 0) {
          line(-1 * instruction[2].x, -1 * instruction[2].y, -1 * instruction[2].x, -1 * instruction[2].y);
          line(-1 * instruction[3].x, -1 * instruction[3].y, -1 * instruction[3].x, -1 * instruction[3].y);
        } else {
          line(instruction[2].x, instruction[2].y, instruction[2].x, instruction[2].y);
          line(instruction[3].x, instruction[3].y, instruction[3].x, instruction[3].y);
        }

        strokeWeight(4);
        // Send Message
        sendMessage("Median (purple) of these points (green). The right-most and left-most points are in cyan.");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE:
        stroke(255, 0, 0);
        if (instruction[5].x < 0) {
          line(-1 * instruction[5].x, -1 * instruction[5].y, -1 * instruction[6].x, -1 * instruction[6].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[6].x, instruction[6].y);
        }
        sendMessage("The Bridge for these points...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.ELIMINATE_l:
        clearCanvas();
        // Draw Points
        if (instruction[4][0].x < 0) {
          sendMessage("We can eliminate all the points to the left of the right point of Bridge...");
          drawPoints(mirror(instruction[4]));
        } else {
          sendMessage("We can eliminate all the points to the right of the left point of Bridge...");
          drawPoints(instruction[4]);
        }
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.ELIMINATE_r:
        clearCanvas();
        if (instruction[4][0].x < 0) {
          drawPoints(mirror(instruction[4]));
          sendMessage("We can eliminate all the points to the right of the left point of the Bridge...");
        } else {
          sendMessage("We can eliminate all the points to the left of the right point of the Bridge...");
          drawPoints(instruction[4]);
        }
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_1_j:
        stroke(0, 255, 255);
        if (instruction[6].x < 0) {
          line(-1 * instruction[6].x, -1 * instruction[6].y, -1 * instruction[6].x, -1 * instruction[6].y);
        } else {
          line(instruction[6].x, instruction[6].y, instruction[6].x, instruction[6].y);
        }
        sendMessage("The right point of the Bridge must belong to the hull as it is equal to the right-most point...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_1_k:
        stroke(0, 255, 255);
        if (instruction[5].x < 0) {
          line(-1 * instruction[5].x, -1 * instruction[5].y, -1 * instruction[5].x, -1 * instruction[5].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[5].x, instruction[5].y);
        }
        sendMessage("The left point of the Bridge must belong to the hull as it is equal to the left-most point...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_2:
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      default:
        sendMessage("Simulation ended or not initialized.");
        break;
    }
  } else {
    sendMessage("Simulation ended or not initialized.");
  }
}

function runSimulationStep() {
  if (algo == ALGORITHM.BRUTE) {
    runBruteStep();
  }
  else if (algo == ALGORITHM.KPS) {
    runKPSStep();
  }
  else if (algo == ALGORITHM.JARVIS) {
    runJarvisStep();
  }
}

function generateConvexHull() {
  if (points.length > 2) {
    if (algo == ALGORITHM.KPS) {
      generateKPS();
    }
    else if (algo == ALGORITHM.BRUTE) {
      generateBrute();
    }
    else if (algo == ALGORITHM.JARVIS) {
      generateJarvis();
    }
  } else {
    sendMessage("At least 3 points are required to generate a convex hull.");
  }
}
function generateBrute() {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let edges = convex.bruteForce(points);
  console.log(edges);
  simulation = convex.simulation;
  console.log(convex.simulation);
  strokeWeight(5);
  stroke(255, 0, 0);
  for (let i = 0; i < edges.length; i++) {
    line(edges[i][0].x, edges[i][0].y, edges[i][1].x, edges[i][1].y);
  }
  initialized = true;
  found = true;
  sendMessage("Convex hull generated successfully.");
}

function generateKPS() {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let hull = convex.KPS(points);
  simulation = convex.simulation;
  console.log(convex.simulation);
  strokeWeight(5);
  stroke(255, 0, 0);
  for (let i = 0; i < hull.length - 1; i++) {
    line(hull[i].x, hull[i].y, hull[i + 1].x, hull[i + 1].y);
  }
  initialized = true;
  found = true;
  sendMessage("Convex hull generated successfully.");
}

function generateJarvis() {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let hull = convex.jarvisAlgorithm(points);
  simulation = convex.simulation;
  console.log(convex.simulation);
  strokeWeight(5);
  stroke(255, 0, 0);
  for (let i = 0; i < hull.length - 1; i++) {
    line(hull[i].x, hull[i].y, hull[i + 1].x, hull[i + 1].y);
  }
  initialized = true;
  found = true;
  sendMessage("Convex hull generated successfully.");
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
  let NUM = document.getElementById("numberPointsTextBox").value;
  for (let i = 0; i < NUM; i++) {
    points.push(createVector(w / 8 + random() * (3 * w / 4), h / 8 + random() * (3 * h / 4)));
  }
  drawPoints(points)
  initialized = true;
  found = false;
  simIdx = 0;
}

function sendMessage(message) {
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