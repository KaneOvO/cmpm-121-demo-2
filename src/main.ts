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

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx?.beginPath();
    ctx?.moveTo(cursor.x, cursor.y);
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

const lineBreak = document.createElement("br");
app.append(lineBreak);

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

const originX = 0;
const originY = 0;

clearButton.addEventListener("click", () => {
  ctx?.clearRect(originX, originY, canvas.width, canvas.height);
});
