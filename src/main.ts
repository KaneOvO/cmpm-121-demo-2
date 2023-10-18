import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Zexuan's Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "thin solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
app.append(canvas);

const ctx = canvas.getContext("2d");

const firstIndex = 0;
const originX = 0;
const originY = 0;
const empty = 0;
const cursor = { active: false, x: 0, y: 0 };
interface Point {
  x: number;
  y: number;
}

const lines: Point[][] = [];
let currentLine: Point[] = [];
const drawChanged = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentLine = [];
  lines.push(currentLine);
  canvas.dispatchEvent(drawChanged);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });
    canvas.dispatchEvent(drawChanged);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  if (currentLine.length > empty) {
    currentLine = [];
    canvas.dispatchEvent(drawChanged);
  }
});

function redraw() {
  ctx!.clearRect(originX, originY, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length) {
      ctx!.beginPath();
      const { x, y } = line[firstIndex];
      ctx!.moveTo(x, y);
      for (const { x, y } of line) {
        ctx!.lineTo(x, y);
      }
      ctx!.stroke();
    }
  }
}

const lineBreak = document.createElement("br");
app.append(lineBreak);

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  if (lines.length > empty) {
    lines.splice(firstIndex, lines.length);
    canvas.dispatchEvent(drawChanged);
  }
});
