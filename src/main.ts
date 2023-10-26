import "./style.css";
const LINE_WIDTH_THIN = 2;
const LINE_WIDTH_THICK = 4;
let LINE_WIDTH = LINE_WIDTH_THIN;
const FIRST_INDEX = 0;
const HEIGHT = 256;
const WIDTH = 256;
const EXPORT_CANVAS_SIZE = 1024;
const ORIGIN = 0;
const EMPTY = 0;
const LEFT_BUTTON = 1;
const HALF = 2;
const EXPORT_TEXT_SACLE = 4;
let IS_STICKER = false;
let STICKER = ``;
let CURRNET_COLOR = `#000000`;
const ALL_TOOL_BUTTONS: ToolButton[] = [];
const DEFAULT_STICKERS: string[] = [`😀`, `😎`, `😍`];

interface Point {
  x: number;
  y: number;
}

class LineCommand {
  private points: Point[];
  private lineWidth: number;
  private isSticker = false;
  private sticker = ``;
  private color = `#000000`;

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
    this.color = CURRNET_COLOR;
  }

  public display(ctx: CanvasRenderingContext2D | null): void {
    if (this.isSticker) {
      const { x, y } = this.points[FIRST_INDEX];
      ctx!.fillText(this.sticker, x, y);
    } else if (ctx && this.lineWidth > EMPTY) {
      ctx.strokeStyle = this.color;
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
      ctx.fillStyle = CURRNET_COLOR;
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
    this.isSticker = isSticker;
    this.setting();
  }

  setting() {
    this.button.addEventListener(`click`, () => {
      if (!this.isClick) {
        this.isClick = true;
        LINE_WIDTH = this.lineWidth;
        IS_STICKER = this.isSticker;
        STICKER = this.isSticker ? this.button.innerHTML : ``;
        this.button.style.border = `2px solid blue`;
        ALL_TOOL_BUTTONS.forEach((tool) => {
          if (tool !== this) {
            tool.isClick = false;
            tool.button.style.border = ``;
          }
        });
      }
    });
  }
}

//Copilot helped streamline this code
const creatButtonContainer = () =>
  app.appendChild(
    Object.assign(document.createElement("div"), {
      style: {
        display: "flex",
        justifyContent: "center",
      },
    })
  );

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

const customStickerButton = document.createElement(`button`);
customStickerButton.innerHTML = `Create Your Sticker`;
buttonContainer2.append(customStickerButton);

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
buttonContainer2.append(exportButton);

customStickerButton.addEventListener(`click`, () => {
  const customStickersInput = prompt(
    `Please enter the custom sticker content and separate multiple stickers with commas:`,
    ``
  );
  if (customStickersInput) {
    //Ask chatgpt how to remove leading and trailing spaces
    const customStickers = customStickersInput
      .split(`,`)
      .map((sticker) => sticker.trim());
    createStickerButtons(customStickers);
  }
});

const buttonContainer3 = creatButtonContainer();

const thinTool = new ToolButton(`🖋️Thin Tool`, LINE_WIDTH_THIN);
const thinButton = thinTool.button;
thinTool.isClick = true;
thinButton.style.border = `2px solid blue`;
buttonContainer3.append(thinButton);
ALL_TOOL_BUTTONS.push(thinTool);
thinTool.setting();

const thickTool = new ToolButton(`🖍️Thick Tool`, LINE_WIDTH_THICK);
const thickButton = thickTool.button;
buttonContainer3.append(thickButton);
ALL_TOOL_BUTTONS.push(thickTool);
thickTool.setting();

const buttonContainer4 = creatButtonContainer();

function createStickerButtons(stickers: string[]): void {
  stickers.forEach((sticker) => {
    const stickerTool = new ToolButton(sticker, EMPTY, true);
    ALL_TOOL_BUTTONS.push(stickerTool);
    buttonContainer4.append(stickerTool.button);
  });
}

createStickerButtons(DEFAULT_STICKERS);

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_CANVAS_SIZE;
  exportCanvas.height = EXPORT_CANVAS_SIZE;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx!.scale(EXPORT_TEXT_SACLE, EXPORT_TEXT_SACLE);

  commands.forEach((cmd) => cmd.display(exportCtx));

  const image = document.createElement("a");
  image.download = "exported_image.png";
  image.href = exportCanvas.toDataURL("image/png");
  image.click();
});

//Ask copilot how to create a color palette
const colorPicker = document.createElement(`input`);
colorPicker.type = `color`;
colorPicker.value = `#000000`;
colorPicker.id = `colorPicker`;

buttonContainer3.appendChild(colorPicker);

colorPicker.addEventListener(`change`, (event) => {
  CURRNET_COLOR = (event.target as HTMLInputElement).value;
});
