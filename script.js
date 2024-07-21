const startButton = document.getElementById("start");
const clearButton = document.getElementById("clear");
const randomButton = document.getElementById("random");
const canvas = document.getElementById("canvas");

const rows = 30;
const cols = 30;

const liveColor = "#ffff00";
const deadColor = "#7e7e7e";

const context = canvas.getContext("2d");

const cellSize = 20;

const cellNeighbours = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  // [0, 0], Current cell which then not to be calculated.
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

let cellGrid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => 0)
);

let interval;

// functions
const toggleCellLife = (x, y, currentState) => {
  if (currentState === 1) {
    cellGrid[y][x] = 0;
  } else {
    cellGrid[y][x] = 1;
  }

  updateBoard();
};

const cellEventListener = (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const i = Math.floor(x / cellSize);
  const j = Math.floor(y / cellSize);

  toggleCellLife(i, j, cellGrid[j][i]);

  // Changing the buttons state when click on the canvas rectangles.
  disablingButtons();
};

const updateBoard = () => {
  const gridWidth = canvas.width;
  const gridHeight = canvas.height;

  // Clear the canvas
  context.clearRect(0, 0, gridWidth, gridHeight);
  canvas.removeEventListener("click", cellEventListener);

  // Filling the board
  cellGrid.forEach((row, j) => {
    row.forEach((col, i) => {
      const x = i * cellSize;
      const y = j * cellSize;

      // Set fill color based on cell state
      context.fillStyle = col === 1 ? liveColor : deadColor;

      // Draw filled rectangle
      context.fillRect(x, y, cellSize, cellSize);

      // Draw border
      context.strokeStyle = "#9a9a9a";
      context.strokeRect(x, y, cellSize, cellSize);
    });
  });

  // Adding Event listener to the canvas
  canvas.addEventListener("click", cellEventListener);

  // Add generation text
  context.font = "500 3rem Rubik";
  context.fillStyle = "rgba(0, 0, 0, 0.25)";
  context.textAlign = "center";
  context.fillText(`MADE BY UZAIF`, canvas.width / 2, canvas.height / 2);
};

const neighbourCount = (x1, y1) => {
  let liveNeighbours = 0;

  cellNeighbours.forEach((cell) => {
    const [x2, y2] = cell;

    const cellStateY = cellGrid[y1 + y2];
    const cellStateX = cellGrid[x1 + x2];

    if (cellStateY && cellStateX) {
      liveNeighbours += cellGrid[y1 + y2][x1 + x2];
    } else {
      liveNeighbours += 0;
    }
  });

  return liveNeighbours;
};

const hasLiveCell = () => {
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cellState = cellGrid[j][i];

      if (cellState === 1) {
        return true;
      }
    }
  }
};

// Function to disable the buttons if now cell is alive.
const disablingButtons = () => {
  if (!hasLiveCell()) {
    startButton.disabled = true;
    clearButton.disabled = true;
    return;
  } else if (startButton.innerText !== "STOP") {
    // When our game is running then the clear button won't be enabled too if we click on a cell.
    startButton.disabled = false;
    clearButton.disabled = false;
  }
};

// Creating the Game loop
const gameLoop = () => {
  const newGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );

  // Calculating each cell's live neighbours count.
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      // Getting whether the current cell is alive or dead.
      const currentState = cellGrid[j][i];

      // Checking the neighbours count of a cell.
      const currentCellNeighbours = neighbourCount(i, j);

      // Applying the rules of Conway's game of life.
      if (
        currentCellNeighbours < 2 ||
        (currentCellNeighbours >= 4 && currentState === 1)
      ) {
        newGrid[j][i] = 0;
      } else if (currentCellNeighbours === 3 && currentState === 0) {
        newGrid[j][i] = 1;
      } else {
        newGrid[j][i] = cellGrid[j][i];
      }
    }
  }

  // Changing the 2D Array
  cellGrid = newGrid;

  // Updating the board based on the 2D Array
  updateBoard();
};

// Attaching the event listeners
startButton.addEventListener("click", (e) => {
  if (e.target.innerText === "START") {
    interval = setInterval(gameLoop, 700);
    e.target.innerText = "stop";
    clearButton.disabled = true;

    // Disabling random button
    randomButton.disabled = true;
  } else {
    clearInterval(interval);
    e.target.innerText = "start";
    clearButton.disabled = false;

    // Disabling random button
    randomButton.disabled = false;

    // Disabling start, clear buttons when click stop the game and if no cell is alive.
    disablingButtons();
  }
});

clearButton.addEventListener("click", () => {
  cellGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );

  updateBoard();

  disablingButtons();
});

randomButton.addEventListener("click", () => {
  cellGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 2))
  );

  updateBoard();

  disablingButtons();
});

// Initializing a board
updateBoard();

// Disabling buttons on initial load when no cell is alive.
disablingButtons();
