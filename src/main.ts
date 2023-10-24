import "./style.css";
const CURSOR_OFFSET_X = -8;
const CURSOR_OFFSET_Y = 16;
const LINE_WIDTH_THIN = 2;
const LINE_WIDTH_THICK = 4;
let LINE_WIDTH = 4;
const FIRST_INDEX = 0;
const HEIGHT = 256;
const WIDTH = 256;
const ORIGIN = 0;
const EMPTY = 0;
const LEFT_BUTTON = 1;

interface Point {
  x: number;
  y: number;
}

class LineCommand {
  private points: Point[];
  private lineWidth: number;

  constructor(x: number, y: number, lineWidth: number) {
    this.points = [{ x, y }];
    this.lineWidth = lineWidth;
  }

  public display(ctx: CanvasRenderingContext2D | null): void {
    if (ctx) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      const { x, y } = this.points[FIRST_INDEX];
      ctx.moveTo(x, y);
      for (const point of this.points) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  }

  public grow(x: number, y: number): void {
    this.points.push({ x, y });
  }
}

class CursorCommand {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D | null): void {
    if (ctx) {
      ctx.font = "32px monospace";
      ctx.fillText("*", this.x + CURSOR_OFFSET_X, this.y + CURSOR_OFFSET_Y);
    }
  }
}

class ToolButton {
  public readonly lineWidth: number;
  public isClick: boolean;
  public button: HTMLButtonElement;

  constructor(name: string, lineWidth: number) {
    this.lineWidth = lineWidth;
    this.button = document.createElement("button");
    this.button.innerHTML = name;
    this.isClick = false;
    this.button.style.fontWeight = ``;
  }
}

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Zexuan's Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.style.cursor = "none";
canvas.style.border = "thin solid black";
canvas.style.borderRadius = "10px";
canvas.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
app.append(canvas);

const ctx = canvas.getContext("2d");

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];
let cursorCommand: CursorCommand | null = null;
let currentLineCommand: LineCommand | null = null;

function notify(name: string) {
  canvas.dispatchEvent(new Event(name));
}

canvas.addEventListener("drawing-changed", () => {
  redraw();
});
canvas.addEventListener("cursor-changed", () => {
  redraw();
});

canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  notify("cursor-changed");
});

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");

  if (e.buttons === LEFT_BUTTON) {
    if (currentLineCommand) {
      currentLineCommand.grow(e.offsetX, e.offsetY);
      notify("drawing-changed");
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(e.offsetX, e.offsetY, LINE_WIDTH);
  commands.push(currentLineCommand);
  redoCommands.splice(FIRST_INDEX, redoCommands.length);
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  notify("drawing-changed");
});

function redraw() {
  ctx!.clearRect(ORIGIN, ORIGIN, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(ctx));
  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
}

const buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.justifyContent = "center";
app.append(buttonContainer);

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
buttonContainer.append(clearButton);
clearButton.addEventListener("click", () => {
  commands.splice(FIRST_INDEX, commands.length);
  redoCommands.splice(FIRST_INDEX, redoCommands.length);
  notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
buttonContainer.append(undoButton);
undoButton.addEventListener("click", () => {
  if (commands.length > EMPTY) {
    redoCommands.push(commands.pop()!);
    notify("drawing-changed");
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
buttonContainer.append(redoButton);
redoButton.addEventListener("click", () => {
  if (redoCommands.length > EMPTY) {
    commands.push(redoCommands.pop()!);
    notify("drawing-changed");
  }
});

const buttonContainer2 = document.createElement("div");
buttonContainer2.style.display = "flex";
buttonContainer2.style.justifyContent = "center";
app.append(buttonContainer2);

const thinTool = new ToolButton(`🖋️Thin Tool`, LINE_WIDTH_THIN);
const thinButton = thinTool.button;
buttonContainer2.append(thinButton);

const thickTool = new ToolButton(`🖍️Thick Tool`, LINE_WIDTH_THICK);
const thickButton = thickTool.button;
thickButton.style.fontWeight = `bold`;
thickTool.isClick = true;
buttonContainer2.append(thickButton);

thinButton.addEventListener(`click`, () => {
  if (!thinTool.isClick && thickTool.isClick) {
    thinButton.style.fontWeight = `bold`;
    thickButton.style.fontWeight = ``;
    LINE_WIDTH = LINE_WIDTH_THIN;
  } else if (thinTool.isClick && !thickTool.isClick) {
    thinButton.style.fontWeight = ``;
    thickButton.style.fontWeight = `bold`;
    LINE_WIDTH = LINE_WIDTH_THICK;
  }
  thinTool.isClick = !thinTool.isClick;
  thickTool.isClick = !thickTool.isClick;
});

thickButton.addEventListener(`click`, () => {
  if (!thickTool.isClick && thinTool.isClick) {
    thinButton.style.fontWeight = ``;
    thickButton.style.fontWeight = `bold`;
    LINE_WIDTH = LINE_WIDTH_THICK;
  } else if (thickTool.isClick && !thinTool.isClick) {
    thinButton.style.fontWeight = `bold`;
    thickButton.style.fontWeight = ``;
    LINE_WIDTH = LINE_WIDTH_THIN;
  }
  thinTool.isClick = !thinTool.isClick;
  thickTool.isClick = !thickTool.isClick;
});
