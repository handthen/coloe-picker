import ColorPicker from "./color-picker.js";
import ColorSide from "./color-side.js";
import ColorOpacity from "./color-opacity.js";

if (typeof window != undefined) {
  window.customElements.define("color-picker", ColorPicker);
  window.customElements.define("color-side", ColorSide);
  window.customElements.define("color-opacity", ColorOpacity);
}

export default class UptoComponent extends HTMLElement {
  state = {};
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
    console.log(e);
    const { b16 } = e.detail;
    this._colorOpacity.setAttribute("color", b16);
  }
  onSideChange(e) {
    console.log(e);
  }
  onOpacityChange(e) {
    console.log(e);
  }
  disconnectedCallback() {
    this.removeEventListener("pickerchange", this._onPickerChange);
    this.removeEventListener("sidechange", this._onSideChange);
    this.removeEventListener("opacitychange", this._onSideChange);
  }
}
