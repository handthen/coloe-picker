import ColorPicker from "./color-picker.js";
import ColorSide from "./color-side.js";
import ColorOpacity from "./color-opacity.js";
import { rgbaToRgb, RgbReg, toRgb, toScale16 } from "../utils/index.js";

if (typeof window != undefined) {
  window.customElements.define("color-picker", ColorPicker);
  window.customElements.define("color-side", ColorSide);
  window.customElements.define("color-opacity", ColorOpacity);
}

export default class UptoComponent extends HTMLElement {
  state = {
    color: {
      opacity: 1,
      b16: "#1677FF",
      rgb: toRgb("#1677FF"),
    },
  };
  static observedAttributes = ["color"];
  constructor() {
    super();
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
      .upto-picker{
        width:300px;
        height:150px;
        background:#fff;
      }
    </style>
      <div part="upto-picker" class="upto-picker">
      </div>
    `;

    this._colorPicker = document.createElement("color-picker");
    this._colorSide = document.createElement("color-side");
    this._colorOpacity = document.createElement("color-opacity");
    const container = template.content.querySelector(".upto-picker");

    this._onPickerChange = this.onPickerChange.bind(this);
    this._onSideChange = this.onSideChange.bind(this);
    this._onOpacityChange = this.onOpacityChange.bind(this);

    this.addEventListener("pickerchange", this._onPickerChange);
    this.addEventListener("sidechange", this._onSideChange);
    this.addEventListener("opacitychange", this._onOpacityChange);

    container.appendChild(this._colorPicker);
    container.appendChild(this._colorSide);
    container.appendChild(this._colorOpacity);

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }
  onPickerChange(e) {
    const { b16, rgba } = e.detail;
    this._colorOpacity.setAttribute("color", b16);
    this.state.color.b16 = b16;
    this.state.color.rgb = rgba;
    this._emit();
  }
  onSideChange(e) {
    const { b16, rgba } = e.detail;
    this._colorPicker.setAttribute("color", b16);
    this.state.color.b16 = b16;
    this.state.color.rgb = rgba;
  }
  onOpacityChange(e) {
    this.state.color.opacity = e.detail.opacity;
    this._emit();
  }
  connectedCallback() {
    if (!this.color) {
      const { b16 } = this.state.color;
      this._colorPicker.setAttribute("color", b16);
      this._colorSide.setAttribute("color", b16);
      this._colorOpacity.setAttribute("color", b16);
    }
  }
  disconnectedCallback() {
    this.removeEventListener("pickerchange", this._onPickerChange);
    this.removeEventListener("sidechange", this._onSideChange);
    this.removeEventListener("opacitychange", this._onSideChange);
  }
  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "color":
        this._colorPicker.setAttribute("color", this.color);
        this._colorSide.setAttribute("color", this.color);
        this._colorOpacity.setAttribute("color", this.color);
        this.state.color.b16 = toScale16(this.color);
        this.state.color.rgb = toRgb(this.color);
        break;
    }
  }
  _emit() {
    const { b16, rgb, opacity } = this.state.color;
    const result = {
      color: b16,
      rgb_color: rgb,
    };

    {
      // 本身带了透明度，先处转换成不带透明度
      const matchs = String(rgb).match(RgbReg).slice(1, 5);
      if (matchs[matchs.length]) {
        result.rgb_color = rgbaToRgb(...matchs);
        result.color = toScale16(result.rgb_color);
      }
    }

    {
      if (opacity < 1) {
        const matchs = String(result.rgb_color).match(RgbReg).slice(1, 4);
        const color = result.color
        console.log(opacity);
        result.color = toScale16(rgbaToRgb(...matchs, opacity));
        console.log(color,Number(opacity/1*255));
        result.rgb_color = toRgb(color + Number(opacity/1*255).toFixed(16))
      }
    }
    const event = new CustomEvent("change", {
      detail: result,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
  get color() {
    const color = this.getAttribute("color");
    return toScale16(color);
  }
}
