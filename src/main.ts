import "./style.css";
const LINE_WIDTH_THIN = 2;
const LINE_WIDTH_THICK = 4;
let LINE_WIDTH = LINE_WIDTH_THIN;
const FIRST_INDEX = 0;
const HEIGHT = 256;
const WIDTH = 256;
const ORIGIN = 0;
const EMPTY = 0;
const LEFT_BUTTON = 1;
const HALF = 2;
let IS_STICKER = false;
let STICKER = ``;

interface Point {
  x: number;
  y: number;
}

class LineCommand {
  private points: Point[];
  private lineWidth: number;
  private isSticker = false;
  private sticker = ``;

  constructor(
    x: number,
    y: number,
    lineWidth: number,
    isSticker: boolean,
    sticker: string
  ) {
    this.points = [{ x, y }];
    this.lineWidth = lineWidth;
    this.isSticker = isSticker;
    this.sticker = sticker;
  }

  public display(ctx: CanvasRenderingContext2D | null): void {
    if (this.isSticker) {
      const { x, y } = this.points[FIRST_INDEX];
      ctx!.fillText(this.sticker, x, y);
    } else if (ctx && this.lineWidth > EMPTY) {
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
  private lineWidth: number;

  constructor(x: number, y: number, lineWidth: number) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
  }

  display(
    ctx: CanvasRenderingContext2D | null,
    isSticker: boolean,
    sticker: string
  ): void {
    if (isSticker) {
      ctx!.fillText(sticker, this.x, this.y);
    } else if (ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.lineWidth / HALF, ORIGIN, Math.PI * HALF);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();
    }
  }
}

class ToolButton {
  public readonly lineWidth: number;
  public isClick: boolean;
  public button: HTMLButtonElement;
  public isSticker: boolean;

  constructor(name: string, lineWidth = EMPTY, isSticker = false) {
    this.lineWidth = lineWidth;
    this.button = document.createElement("button");
    this.button.innerHTML = name;
    this.isClick = false;
    this.button.style.fontWeight = ``;
    this.isSticker = isSticker;
  }

  setting(
    tool1: ToolButton,
    tool2: ToolButton,
    tool3: ToolButton,
    tool4: ToolButton
  ) {
    this.button.addEventListener(`click`, () => {
      if (!this.isSticker) {
        if (!this.isClick) {
          this.isClick = true;
          tool1.isClick = false;
          tool2.isClick = false;
          tool3.isClick = false;
          tool4.isClick = false;
          LINE_WIDTH = this.lineWidth;
          IS_STICKER = false;
          STICKER = ``;
          this.button.style.border = `2px solid blue`;
          tool1.button.style.border = ``;
          tool2.button.style.border = ``;
          tool3.button.style.border = ``;
          tool4.button.style.border = ``;
        }
      } else {
        if (!this.isClick) {
          this.isClick = true;
          tool1.isClick = false;
          tool2.isClick = false;
          tool3.isClick = false;
          tool4.isClick = false;
          LINE_WIDTH = this.lineWidth;
          IS_STICKER = this.isSticker;
          STICKER = this.button.innerHTML;
          this.button.style.border = `2px solid blue`;
          tool1.button.style.border = ``;
          tool2.button.style.border = ``;
          tool3.button.style.border = ``;
          tool4.button.style.border = ``;
        }
      }
    });
  }
}

function creatButtonContainer() {
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  app.append(buttonContainer);
  return buttonContainer;
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
canvas.addEventListener("tool-moved", () => {
  redraw();
});

canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, LINE_WIDTH);
  notify("tool-moved");
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, LINE_WIDTH);
  notify("tool-moved");

  if (e.buttons === LEFT_BUTTON) {
    if (currentLineCommand) {
      currentLineCommand.grow(e.offsetX, e.offsetY);
      notify("drawing-changed");
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(
    e.offsetX,
    e.offsetY,
    LINE_WIDTH,
    IS_STICKER,
    STICKER
  );
  cursorCommand = null;
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
    cursorCommand.display(ctx, IS_STICKER, STICKER);
  }
}

const buttonContainer = creatButtonContainer();

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

const buttonContainer2 = creatButtonContainer();

const thinTool = new ToolButton(`🖋️Thin Tool`, LINE_WIDTH_THIN);
const thinButton = thinTool.button;
thinTool.isClick = true;
thinButton.style.border = `2px solid blue`;
buttonContainer2.append(thinButton);

const thickTool = new ToolButton(`🖍️Thick Tool`, LINE_WIDTH_THICK);
const thickButton = thickTool.button;
buttonContainer2.append(thickButton);

const buttonContainer3 = creatButtonContainer();

const stickerTool1 = new ToolButton(`😀`, EMPTY, true);
const stickerButton1 = stickerTool1.button;
buttonContainer3.append(stickerButton1);

const stickerTool2 = new ToolButton(`😎`, EMPTY, true);
const stickerButton2 = stickerTool2.button;
buttonContainer3.append(stickerButton2);

const stickerTool3 = new ToolButton(`😍`, EMPTY, true);
const stickerButton3 = stickerTool3.button;
buttonContainer3.append(stickerButton3);

thinTool.setting(thickTool, stickerTool1, stickerTool2, stickerTool3);
thickTool.setting(thinTool, stickerTool1, stickerTool2, stickerTool3);
stickerTool1.setting(thinTool, thickTool, stickerTool2, stickerTool3);
stickerTool2.setting(thinTool, thickTool, stickerTool1, stickerTool3);
stickerTool3.setting(thinTool, thickTool, stickerTool1, stickerTool2);
