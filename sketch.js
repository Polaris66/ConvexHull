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
let defaultPoints = '100';
let TIMEOUT = 500;

let algo = 1;
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
  'BRIDGE_1': 15,
  'BRIDGE_2': 16,
  'BRIDGE_3': 17,
  'BRIDGE_4': 18
});


function setup() {
  let container = createDiv();
  container.class('flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white');

  let header = createDiv("Convex Hull Visualizer");
  header.class('text-4xl font-bold mb-8 py-4');

  let buttonsContainer = createDiv();
  buttonsContainer.class('flex flex-wrap justify-center mb-8');

  let buttonClasses = 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg mx-2 transition-colors duration-300 mt-10';
  let algobuttonClasses = 'algorithm-button bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg mx-2 transition-colors duration-300 mt-10';

  generateButton = createButton('Generate Convex Hull');
  generateButton.class(buttonClasses);
  generateButton.mousePressed(generateConvexHull);
  buttonsContainer.child(generateButton);

  randomlyInitializeButton = createButton('Randomly Initialize Points');
  randomlyInitializeButton.class(buttonClasses);
  randomlyInitializeButton.mousePressed(generatePoints);
  buttonsContainer.child(randomlyInitializeButton);

  clearButton = createButton('Clear Canvas');
  clearButton.class(buttonClasses);
  clearButton.mousePressed(clearCanvas);
  buttonsContainer.child(clearButton);

  simulateButton = createButton('Visualize');
  simulateButton.class(buttonClasses);
  simulateButton.mousePressed(runSimulationStep);
  buttonsContainer.child(simulateButton);

  let algorithmButtons = [['Brute Force', 'BruteForce'], ['Kirk Seidal Algorithm', 'KPS'], ['Jarvis Algorithm', 'Jarvis']];
  algorithmButtons.forEach(algorithm => {
    let algorithmButton = createButton(algorithm[0]);
    algorithmButton.class(algobuttonClasses);
    algorithmButton.id(algorithm[1]);
    algorithmButton.mousePressed(() => toggleAlgorithm(algorithm[1]));
    buttonsContainer.child(algorithmButton);
  });

  container.child(header);
  container.child(buttonsContainer);

  let numberPointsTextBox = createInput(defaultPoints);
  numberPointsTextBox.class('bg-gray-200 text-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-600');
  numberPointsTextBox.id('numberPointsTextBox');
  numberPointsTextBox.attribute('type', 'number');
  numberPointsTextBox.attribute('placeholder', 'Enter number of points');
  container.child(numberPointsTextBox);

  let messageDiv = createDiv('');
  messageDiv.id('messageDiv');
  messageDiv.class('bg-gray-200 text-gray-700 py-2 px-4 rounded-lg my-4');
  messageDiv.style('font-size', '16px');
  container.child(messageDiv);

  let canvasContainer = createDiv();
  canvasContainer.class('border-4 border-gray-300 rounded-lg my-4');
  createCanvas(WIDTH, HEIGHT).parent(canvasContainer);
  background(0);
  stroke(255);
  strokeWeight(3);
  container.child(canvasContainer);
}

function toggleAlgorithm(id) {
  document.querySelectorAll('.algorithm-button').forEach(button => {
    button.classList.remove('bg-orange-600');
    button.classList.remove('bg-indigo-600');
    button.classList.add('bg-indigo-600');
  });

  let button = document.getElementById(id);
  button.classList.remove('bg-indigo-600');
  button.classList.add('bg-orange-600');

  if (id === "BruteForce") {
    toggleBrute();
  } else if (id === "KPS") {
    toggleKPS();
  } else if (id === "Jarvis") {
    toggleJarvis();
  }
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
  if (!found) {
    generateBrute(true);
  }
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
        stroke(0, 255, 0);
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
  if (!found) {
    generateJarvis(true);
  }
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
  if (!found) {
    generateKPS(true);
  }
  if (found && simulation && simulation.length > 0) {
    let instruction = simulation.shift(); // Get the first instruction from the simulation array
    strokeWeight(3);
    switch (instruction[0]) {
      case TYPE.MEDIAN:
        clearCanvas();
        // Show points in white
        stroke(255);
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
        strokeWeight(3);
        stroke(0, 255, 255);
        if (instruction[2].x < 0) {
          line(-1 * instruction[2].x, -1 * instruction[2].y, -1 * instruction[2].x, -1 * instruction[2].y);
          line(-1 * instruction[3].x, -1 * instruction[3].y, -1 * instruction[3].x, -1 * instruction[3].y);
        } else {
          line(instruction[2].x, instruction[2].y, instruction[2].x, instruction[2].y);
          line(instruction[3].x, instruction[3].y, instruction[3].x, instruction[3].y);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[5].length > 0 && instruction[5][0].x < 0) {
          let hull = mirror(instruction[5])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[5].length > 0) {
          let hull = instruction[5];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        // Send Message
        sendMessage("Median (purple) of these points (green). The right-most and left-most points are in cyan.");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE:
        clearCanvas();
        // Show points in white
        stroke(255);
        if (instruction[4][0].x < 0) {
          drawPoints(mirror(instruction[4]));
        } else {
          drawPoints(instruction[4]);
        }
        // Draw Bridge in Green
        stroke(0, 255, 0);
        if (instruction[5].x < 0) {
          line(-1 * instruction[5].x, -1 * instruction[5].y, -1 * instruction[6].x, -1 * instruction[6].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[6].x, instruction[6].y);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[7].length > 0 && instruction[7][0].x < 0) {
          let hull = mirror(instruction[7])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[7].length > 0) {
          let hull = instruction[7];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        sendMessage("The Bridge for these points...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.ELIMINATE_l:
        clearCanvas();
        // Draw Points in white
        stroke(255);
        if (instruction[4][0].x < 0) {
          sendMessage("We can eliminate all the points to the left of the right point of Bridge...");
          drawPoints(mirror(instruction[4]));
        } else {
          sendMessage("We can eliminate all the points to the right of the left point of Bridge...");
          drawPoints(instruction[4]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[7].length > 0 && instruction[7][0].x < 0) {
          let hull = mirror(instruction[7])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[7].length > 0) {
          let hull = instruction[7];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.ELIMINATE_r:
        clearCanvas();
        stroke(255);
        if (instruction[4][0].x < 0) {
          drawPoints(mirror(instruction[4]));
          sendMessage("We can eliminate all the points to the right of the left point of the Bridge...");
        } else {
          sendMessage("We can eliminate all the points to the left of the right point of the Bridge...");
          drawPoints(instruction[4]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[7].length > 0 && instruction[7][0].x < 0) {
          let hull = mirror(instruction[7])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[7].length > 0) {
          let hull = instruction[7];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_1_j:
        clearCanvas();
        stroke(0, 255, 255);
        if (instruction[6].x < 0) {
          line(-1 * instruction[6].x, -1 * instruction[6].y, -1 * instruction[6].x, -1 * instruction[6].y);
        } else {
          line(instruction[6].x, instruction[6].y, instruction[6].x, instruction[6].y);
        }
        // Draw hull in red
        stroke(255, 0, 0);
        if (instruction[7].length > 0 && instruction[7][0].x < 0) {
          let hull = mirror(instruction[7])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[7].length > 0) {
          let hull = instruction[7];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        sendMessage("The right point of the Bridge must belong to the hull as it is equal to the right-most point...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_1_k:
        clearCanvas();
        stroke(0, 255, 255);
        if (instruction[5].x < 0) {
          line(-1 * instruction[5].x, -1 * instruction[5].y, -1 * instruction[5].x, -1 * instruction[5].y);
        } else {
          line(instruction[5].x, instruction[5].y, instruction[5].x, instruction[5].y);
        }
        // Draw hull in red
        stroke(255, 0, 0);
        if (instruction[7].length > 0 && instruction[7][0].x < 0) {
          let hull = mirror(instruction[7])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[7].length > 0) {
          let hull = instruction[7];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        sendMessage("The left point of the Bridge must belong to the hull as it is equal to the left-most point...");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.HULL_2:
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE_1:
        clearCanvas();
        // Show points in white
        stroke(255);
        if (instruction[2][0].x < 0) {
          drawPoints(mirror(instruction[2]));
        } else {
          drawPoints(instruction[2]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[4].length > 0 && instruction[4][0].x < 0) {
          let hull = mirror(instruction[4])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[4].length > 0) {
          let hull = instruction[4];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        // Draw Median
        stroke(255, 0, 255);
        if (instruction[1] < 0) {
          line(-1 * instruction[1], 0, -1 * instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Show Pairs
        stroke(255, 255, 0);
        for (let pair of instruction[3]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);
          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }

        }
        sendMessage("All the chosen pairs in this iteration.");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE_2:
        clearCanvas();
        // Show points in white
        stroke(255);
        if (instruction[2][0].x < 0) {
          drawPoints(mirror(instruction[2]));
        } else {
          drawPoints(instruction[2]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[4].length > 0 && instruction[4][0].x < 0) {
          let hull = mirror(instruction[4])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[4].length > 0) {
          let hull = instruction[4];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        // Draw Median
        stroke(255, 0, 255);
        if (instruction[1] < 0) {
          line(-1 * instruction[1], 0, -1 * instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Show Pairs
        stroke(255, 255, 0);
        for (let pair of instruction[3]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);
          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        // Show lesser, equal and greater
        stroke(128, 0, 128);
        for (let pair of instruction[5]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 255, 0);
        for (let pair of instruction[6]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 0, 255);
        for (let pair of instruction[7]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        sendMessage("The pairs with slope lesser, equal to and greater than the medium in purple, green, blue");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE_3:
        clearCanvas();
        // Show points in white
        stroke(255);
        if (instruction[2][0].x < 0) {
          drawPoints(mirror(instruction[2]));
        } else {
          drawPoints(instruction[2]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[4].length > 0 && instruction[4][0].x < 0) {
          let hull = mirror(instruction[4])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[4].length > 0) {
          let hull = instruction[4];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        // Draw Median
        stroke(255, 0, 255);
        if (instruction[1] < 0) {
          line(-1 * instruction[1], 0, -1 * instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Show Pairs
        stroke(255, 255, 0);
        for (let pair of instruction[3]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        // Show lesser, equal and greater
        stroke(128, 0, 128);
        for (let pair of instruction[5]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 255, 0);
        for (let pair of instruction[6]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 0, 255);
        for (let pair of instruction[7]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(255);
        strokeWeight(10);
        if (instruction[8].x < 0) {
          point(-1 * instruction[8].x, -1 * instruction[8].y)
          point(-1 * instruction[9].x, -1 * instruction[9].y);
        } else {
          point(instruction[8].x, instruction[8].y)
          point(instruction[9].x, instruction[9].y);
        }
        strokeWeight(3);
        sendMessage("The pair with the highest intersection with y axis in white.");
        setTimeout(runSimulationStep, TIMEOUT);
        break;
      case TYPE.BRIDGE_4:
        clearCanvas();
        // Show points in white
        stroke(255);
        if (instruction[2][0].x < 0) {
          drawPoints(mirror(instruction[2]));
        } else {
          drawPoints(instruction[2]);
        }
        // Draw Hull in red
        stroke(255, 0, 0);
        if (instruction[4].length > 0 && instruction[4][0].x < 0) {
          let hull = mirror(instruction[4])
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        } else if (instruction[4].length > 0) {
          let hull = instruction[4];
          for (let idx = 0; idx < hull.length - 1; idx++) {
            line(hull[idx].x, hull[idx].y, hull[idx + 1].x, hull[idx + 1].y);
          }
        }
        // Draw Median
        stroke(255, 0, 255);
        if (instruction[1] < 0) {
          line(-1 * instruction[1], 0, -1 * instruction[1], WIDTH);
        } else {
          line(instruction[1], 0, instruction[1], WIDTH);
        }
        // Show Pairs
        stroke(255, 255, 0);
        for (let pair of instruction[3]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        // Show lesser, equal and greater
        stroke(128, 0, 128);
        for (let pair of instruction[5]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 255, 0);
        for (let pair of instruction[6]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(0, 0, 255);
        for (let pair of instruction[7]) {
          if (pair[0].x < 0) {
            line(-1 * pair[0].x, -1 * pair[0].y, -1 * pair[1].x, -1 * pair[1].y);

          } else {
            line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
          }
        }
        stroke(255);
        strokeWeight(10);
        if (instruction[8].x < 0) {
          point(-1 * instruction[8].x, -1 * instruction[8].y)
          point(-1 * instruction[9].x, -1 * instruction[9].y);
        } else {
          point(instruction[8].x, instruction[8].y)
          point(instruction[9].x, instruction[9].y);
        }
        strokeWeight(3);
        // Draw the candidates
        strokeWeight(7);
        stroke(255, 255, 0);
        if (instruction[10].x < 0) {
          drawPoints(mirror(instruction[10]));
        } else {
          drawPoints(instruction[10]);
        }
        stroke(255);
        strokeWeight(3);
        sendMessage("The filtered candidates for the bridge function.");
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

function generateBrute(visualize = false) {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let edges = convex.bruteForce(points, visualize);
  console.log(edges);
  simulation = convex.simulation;
  console.log(convex.simulation);
  strokeWeight(5);
  stroke(255, 0, 0);
  for (let i = 0; i < edges.length; i++) {
    line(edges[i][0].x, edges[i][0].y, edges[i][1].x, edges[i][1].y);
  }
  initialized = true;
  if (visualize) {
    found = true;
  }
  sendMessage("Convex hull generated successfully.");
}

function generateKPS(visualize = false) {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let hull = convex.KPS(points, visualize);
  simulation = convex.simulation;
  console.log("simulation");
  console.log(convex.simulation);
  strokeWeight(3);
  stroke(255, 0, 0);
  for (let i = 0; i < hull.length - 1; i++) {
    line(hull[i].x, hull[i].y, hull[i + 1].x, hull[i + 1].y);
  }
  initialized = true;
  if (visualize) {
    found = true;
  }
  sendMessage("Convex hull generated successfully.");
}

function generateJarvis(visualize = false) {
  let convex = new ConvexHull();
  convex.points = points.slice();
  let hull = convex.jarvisAlgorithm(points, visualize);
  simulation = convex.simulation;
  console.log(convex.simulation);
  strokeWeight(5);
  stroke(255, 0, 0);
  for (let i = 0; i < hull.length - 1; i++) {
    line(hull[i].x, hull[i].y, hull[i + 1].x, hull[i + 1].y);
  }
  initialized = true;
  if (visualize) {
    found = true;
  }
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
  // points.push(createVector(176.29774904394873, 413.7634967776654));
  // points.push(createVector(389.70764196174673, 353.7124942814699))
  // points.push(createVector(247.00453644173467, 385.06199091236857))
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