import { toScale16 } from "../utils/index.js";

const getBody = () => `
<style>
  .upto-color-wrapper {
    position: relative;
    width: 100%;
    font-size: 0;
    height:calc(100% - 44px);
}
.canvas-point {
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-radius: 50%;
    position: absolute;
    background: transparent;
    box-sizing: border-box;
    right: 0;
    top: 0;
}
    #color_picker_canvas{
      border-radius:var(--upto-canvas-radius,0)
    }
 </style>
 <div part="upto-wrapper" id="upto-color-wrapper" class="upto-color-wrapper">
        <canvas part="upto-canvas" id="color_picker_canvas" style="width: 100%;height: 100%;"></canvas>
        <div part="upto-point" id="point" class="canvas-point"></div>
 </div>
`;

const state = {
  width: 300,
  height: 150,
  position: {
    x: -8,
    y: -8,
    targetX: 0,
    targetY: 0,
    oldX: 0,
    oldY: 0,
  },
};
class ColorPicker extends HTMLElement {
  state = state;
  _canvas = null;
  _ctx = null;
  _point = null;
  static observedAttributes = ["color"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this._temp = this._getTemp(getBody());
    this._canvas = this._temp.querySelector("#color_picker_canvas");
    this._point = this._temp.querySelector("#point");
    this._ctx = this._canvas.getContext("2d");
    shadow.appendChild(this._temp);
    this.shadow = shadow;
  }
  setPosition(obj) {
    obj.y && this._point.style.setProperty("top", obj.y + "px");
    obj.x && this._point.style.setProperty("left", obj.x + "px");
    this.state.position = { ...this.state.position, ...obj };
  }

  initCanvasColor(s) {
    const { width, height } = this._canvas;
    const ctx = this._ctx;
    if (!ctx || !this.color) return;
    const color = this.color;
    // 1. 填充底色 (纯色)
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // 2. 左到右绘制白色渐变 (透明 -> 白)
    const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, "rgba(255,255,255,1)");
    whiteGradient.addColorStop(0.01, "rgba(255,255,255,1)");
    whiteGradient.addColorStop(0.99, "rgba(255,255,255,0)");
    whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height);

    // 3. 上到下绘制黑色渐变 (透明 -> 黑)
    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, "transparent");
    blackGradient.addColorStop(0.01, "transparent");
    // blackGradient.addColorStop(0.01, "rgba(0,0,0,0)");
    blackGradient.addColorStop(0.99, "rgba(0,0,0,1)");
    blackGradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);
  }

  changeColor(e) {
    const { offsetX, offsetY } = e;
    // _emit(offsetX, offsetY)
    this.setPosition({ x: offsetX - 8, y: offsetY - 8 });
    this.mousedown(e);
  }
  mousedown(e) {
    const { clientX, clientY } = e;
    const state = this.state;
    state.oldX = state.x;
    state.oldY = state.y;
    this.setPosition({
      oldX: state.position.x,
      oldY: state.position.y,
      targetX: clientX,
      targetY: clientY,
    });
    this._mouseup = this.mouseup.bind(this);
    this._mousemove = this.mousemove.bind(this);
    document.addEventListener("mouseup", this._mouseup);
    document.addEventListener("mousemove", this._mousemove);
  }

  mousemove(e) {
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = e;
    const { width, height } = this.state;
    const { targetX, targetY, oldX, oldY } = this.state.position;
    let x = clientX - targetX + oldX;
    let y = clientY - targetY + oldY;

    if (x >= width - 8) {
      x = width - 8;
    }
    if (x <= -8) {
      x = -8;
    }
    if (y >= height - 8) {
      y = height - 8;
    }
    if (y <= -8) {
      y = -8;
    }
    this.setPosition({ x, y });
  }
  mouseup(e) {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener("mouseup", this._mouseup);
    document.removeEventListener("mousemove", this._mousemove);
    this._emit();
  }
  _emit() {
    try {
      let { x, y } = this.state.position;
      x = x <= 0 ? 0 : x+6;
      y = y <= 0 ? 0 : y+6;
      const data = this._ctx.getImageData(x, y, 1, 1)?.data;
      const rgba = `rgba(${data[0]},${data[1]},${data[2]},${data[3] / 255})`;
      const color = {
        rgba,
        b16: toScale16(rgba),
      };
      const event = new CustomEvent("pickerchange", {
        detail: color,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);

      return rgba;
    } catch (e) {
      console.log(e);
    }
  }
  connectedCallback() {
    const canvasStyle = getComputedStyle(this._canvas);
    const width = +canvasStyle.width.replace("px", "");
    const height = +canvasStyle.height.replace("px", "");
    this._canvas.width = width * window.devicePixelRatio;
    this._canvas.height = height * window.devicePixelRatio;
    this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.state.width = width;
    this.state.height = height;
    if (!this._init) {
      this.initCanvasColor();
      this._init = true;
    }

    this._canvas.addEventListener("mousedown", this.changeColor.bind(this));
    this._point.addEventListener("mousedown", this.mousedown.bind(this));
  }
  disconnectedCallback() {}
  adoptedCallback() {}
  attributeChangedCallback(name, oldVal, newVal) {
    if (name == "color") {
      this.initCanvasColor();
      this._init = true;
    }
  }

  _getTemp(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.cloneNode(true);
  }

  get color() {
    return this.getAttribute("color");
  }
}
export default ColorPicker;
