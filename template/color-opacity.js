import { toRgb,RgbReg } from "../utils/index.js";

const body = `
<style>
  .upto-side{
    --upto-side-size:12px;
    width:100%;
    height:var(--upto-side-size);
    position: relative;
    border-radius:8px;
    font-size:0;
    background-image: conic-gradient(rgba(0, 0, 0, 0.06) 25%, transparent 25% 50%, rgba(0, 0, 0, 0.06) 50% 75%, transparent 75% 100%);
    background-size: 8px 8px;
  }
  #side-canvas{
    width:100%;
    height:100%;
    border-radius:8px;
  }
  #side-crice{
      cursor: pointer;
      user-select: none;
      width: var(--upto-side-size);
      height: var(--upto-side-size);
      border-radius: 50%;
      background: transparent;
      border: 2px solid #fff;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      box-sizing: border-box;
      z-index: 2;
      right:0;
      pointer-events: none;
    }
</style>
  <div class='upto-side'>
    <canvas id="side-canvas"></canvas>
    <div id="side-crice"></div>
  </div>
`;

export default class ColorOpacity extends HTMLElement {
  state = {
    x: 0,
    targetX: 0,
    oldX: 0,
  };
  static observedAttributes = ["color"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = body;
    const content = template.content.cloneNode(true);
    this._canvas = content.querySelector("#side-canvas");
    this._side = content.querySelector(".upto-side");
    this._side_crice = content.querySelector("#side-crice");
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    shadow.appendChild(content);
  }
  setPosition(obj) {
    obj.x & this._side_crice.style.setProperty("left", obj.x + "px");
    this.state = {
      ...this.state,
      ...obj,
    };
  }
  initCanvasColor() {
    const canvas = this._canvas;
    let color = this.color;
    if (!color) return;
    if (color.length == 4) {
      color = color + color.slice(1, 4);
    }
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    const g = ctx.createLinearGradient(0, 0, width, 0);
    let opacityColor = color;
    if (color.length > 7) {
      opacityColor = color.slice(0, 7);
    }
    g.addColorStop(0, opacityColor + "00");
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  connectedCallback() {
    this.state.width = +getComputedStyle(this._side).width.replace("px", "");
    this._mousedown = this.mousedown.bind(this);
    this._side_crice.addEventListener("mousedown", this._mousedown);
    this._side.addEventListener("mousedown", this._mousedown);
    if (!this._init) {
      this.initCanvasColor();
      this._init = true;
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "color":
        this.initCanvasColor();
        this._init = true;
        break;
    }
  }

  mousedown(e) {
    e.preventDefault();
    const { clientX, offsetX, target } = e;
    if (target.id !== "side-crice") {
      this.state.x = offsetX - 6;
    }
    this.state.oldX = this.state.x;
    this.setPosition({ ...this.state, targetX: clientX });
    this._mouseup = this.mouseup.bind(this);
    this._mousemove = this.mousemove.bind(this);
    document.addEventListener("mouseup", this._mouseup);
    document.addEventListener("mousemove", this._mousemove);
    this._emit("transtion");
  }

  mousemove(e) {
    const { clientX } = e;
    const { targetX, oldX, width } = this.state;
    let x = clientX - targetX + oldX;
    if (x >= width - 12) {
      x = width - 12;
    }
    if (x <= 0) {
      x = 0;
    }
    this.setPosition({ ...this.state, x });
    this._emit("transtion");
  }
  mouseup(e) {
    document.removeEventListener("mouseup", this._mouseup);
    document.removeEventListener("mousemove", this._mousemove);
    this._emit();
  }
  computedSideOffset() {
    const color = this.color;
    if (color) {
      const RgbColor = toRgb(color);
      const matchs = RgbColor.match(RgbReg);
      if (!matchs) return;
      const [_,__,___,opacity] = matchs.slice(1,5)
      if (!opacity) return;
      const offset = opacity * this.state.width - 12;
      this.setPosition({ x: offset });
    }
  }
  _emit(eventName = "opacitychange") {
    const width = this.state.width;
    const offset = this.state.x === 0 ? 0 : this.state.x + 12;
    const event = new CustomEvent(eventName, {
      detail: {
        opacity: Math.min(+Number(offset / width).toFixed(2), 1),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
  get color() {
    return this.getAttribute("color");
  }
}
