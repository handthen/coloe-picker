import { toScale16 } from "../utils/index.js";

const body = `
<style>
  .upto-side{
    --upto-side-size:12px;
    width:100%;
    height:var(--upto-side-size);
    position: relative;
    border-radius:8px;
    font-size:0;
    margin-top:12px;
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
  static observedAttribute = ["color"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = body;
    const content = template.content.cloneNode(true);
    this._canvas = content.querySelector("#side-canvas");
    this._side = content.querySelector(".upto-side");
    this._side_crice = content.querySelector("#side-crice");
    this._ctx = this._canvas.getContext("2d");
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
    let color = this.color || "#000000";
    if (color.length == 4) {
      color = color + color.slice(1, 4);
    }
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
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
    }
  }
  attributechangeCallback(name, oldVal, newVal) {
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
    const clientWidth = target.clientWidth;
    if (target.id !== "side-crice") {
      this.state.x = offsetX - 8;
    }
    this.state.oldX = this.state.x;
    this.setPosition({ ...this.state, targetX: clientX });
    this._mouseup = this.mouseup.bind(this);
    this._mousemove = this.mousemove.bind(this);
    document.addEventListener("mouseup", this._mouseup);
    document.addEventListener("mousemove", this._mousemove);
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
  }

  mouseup(e) {
    document.removeEventListener("mouseup", this._mouseup);
    document.removeEventListener("mousemove", this._mousemove);
    this._emit();
  }
  getColor() {
    try {
      let { x } = this.state;
      x = x < 0 ? 0 : x;
      const data = this._ctx.getImageData(x, 6, 1, 1)?.data;
      const rgba = `rgb(${data[0]},${data[1]},${data[2]},${data[3]})`;
      const color = {
        rgba,
        b16: toScale16(rgba),
      };
      const event = new CustomEvent("sidechange", {
        detail: color,
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
      this.setPosition({ x });
      return color;
    } catch (e) {
      console.log(e);
    }
  }
  _emit() {
    const width = this.state.width;
    const offset = this.state.x;
    const event = new CustomEvent("opacitychange", {
      detail: {
        opacity: +Number(offset / width).toFixed(2),
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
