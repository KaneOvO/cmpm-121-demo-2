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
