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
  connectedCallbacks = [];
  static observedAttributes = ["color"];
  constructor() {
    super();
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
      .upto-picker{
        width:100%;
        background:#fff;
        height:100%;
       }
        .side-tool{
          display:flex;
          align-items:center;
          margin-top:12px;
          height:32px;
        }
        .side-content{
          flex:1;
          height:100%;
          display:flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .slot-block-default{
          width:28px;
          height:28px;
          border-radius:4px;
          margin-left:12px;
          background-image: conic-gradient(rgba(0, 0, 0, 0.06) 25%, transparent 25% 50%, rgba(0, 0, 0, 0.06) 50% 75%, transparent 75% 100%);
          background-size: 50% 50%;
        }
        .slot-block-inner{
            width:100%;
            height:100%;
            border-radius:4px;
        }
    </style>
      <div part="upto-picker" class="upto-picker">
      
      </div>
    `;

    const cloneTemplate = template.content.cloneNode(true);

    const templateSide = document.createElement("template");

    templateSide.innerHTML = `
       <div class="side-tool">
         <div class="side-content"></div>
         <div class="side-slot">
           <slot name="right-inner">
             <div class="slot-block-default">
               <div class="slot-block-inner"></div>
             </div>
           </slot>
         </div>
       </div>
    `;
    const sideContainer = templateSide.content.querySelector(".side-content");

    this._sideToolInner =
      templateSide.content.querySelector(".slot-block-inner");
    this._colorPicker = document.createElement("color-picker");
    this._colorSide = document.createElement("color-side");
    this._colorOpacity = document.createElement("color-opacity");
    const container = cloneTemplate.querySelector(".upto-picker");

    this._onPickerChange = this.onPickerChange.bind(this);
    this._onSideChange = this.onSideChange.bind(this);
    this._onOpacityChange = this.onOpacityChange.bind(this);
    this._onTranstion = this.onTranstion.bind(this);
    this.addEventListener("pickerchange", this._onPickerChange);
    this.addEventListener("sidechange", this._onSideChange);
    this.addEventListener("opacitychange", this._onOpacityChange);
    this.addEventListener("transtion", this._onTranstion);

    container.appendChild(this._colorPicker);
    sideContainer.appendChild(this._colorSide);
    sideContainer.appendChild(this._colorOpacity);
    container.appendChild(templateSide.content);

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(cloneTemplate);
  }
  onPickerChange(e) {
    const { b16, rgba } = e.detail;
    this._colorOpacity.setAttribute("color", b16);
    this.state.color.b16 = b16;
    this.state.color.rgb = rgba;
    this._emit("change");
  }
  onSideChange(e) {
    const { b16, rgba } = e.detail;
    this._colorPicker.setAttribute("color", b16);
    this.state.color.b16 = b16;
    this.state.color.rgb = rgba;
    this._colorOpacity.setAttribute("color", b16);
    this._emit("change");
  }
  onTranstion(e) {
    this.state.color.opacity = e.detail.opacity;
    const result = this._computedColor();
    this._sideToolInner.style.setProperty("background", result.rgb_color);
  }
  onOpacityChange(e) {
    this.state.color.opacity = e.detail.opacity;
    this._emit("change");
  }
  setAttributeColor() {
    const { b16, rgb } = this.state.color;
    this._colorPicker.setAttribute("color", b16);
    this._colorSide.setAttribute("color", b16);
    this._colorOpacity.setAttribute("color", b16);
    this._sideToolInner.style.setProperty("background", rgb);
    this._colorSide.computedSideOffset();
    this._colorOpacity.computedSideOffset();
  }
  connectedCallback() {
    this.connectedCallbacks.forEach((item) => item.call(this));
    this.connectedCallbacks = [];
    const color = this.color;
    if (!color) {
      this.setAttributeColor();
    }
    this._emit("connected", {
      opacity: 1,
      color: color,
      rgb_color: toRgb(color),
    });
  }
  disconnectedCallback() {
    this.removeEventListener("pickerchange", this._onPickerChange);
    this.removeEventListener("sidechange", this._onSideChange);
    this.removeEventListener("opacitychange", this._onSideChange);
    this.removeEventListener("transtion", this._onTranstion);
    this._emit("disconnected");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "color":
        const color = this.color;
        if (color) {
          this.state.color.b16 = toScale16(color);
          this.state.color.rgb = toRgb(color);
          this.setAttributeColor();
        }
        break;
    }
  }
  _computedColor() {
    const { b16, rgb, opacity } = this.state.color;

    const result = {
      color: b16,
      rgb_color: rgb,
      opacity,
    };

    {
      // 本身带了透明度，先处转换成不带透明度
      const matchStr = String(rgb).match(RgbReg);
      if (matchStr) {
        const matchs = matchStr.slice(1, 5);
        if (matchs[matchs.length - 1]) {
          result.rgb_color = rgbaToRgb(...matchs);
          result.color = toScale16(result.rgb_color);
        }
      }
    }

    {
      if (opacity <= 1) {
        const matchStr = String(result.rgb_color).match(RgbReg);
        if (matchStr) {
          const matchs = matchStr.slice(1, 4);
          matchs.push(opacity);
          result.rgb_color = `rgb(${matchs.join(",")})`;
          result.color = toScale16(result.rgb_color);
        }
      }
    }

    return result;
  }
  _emit(eventName = "change", data = {}) {
    const result = this._computedColor();
    this._sideToolInner.style.setProperty("background", result.rgb_color);
    const event = new CustomEvent(eventName, {
      detail: { ...result, ...data },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
  set color(val) {
    if (!this.isConnected) {
      this.connectedCallbacks.push(() => {
        this.setAttribute("color", toScale16(val));
      });
    } else {
      this.setAttribute("color", toScale16(val));
    }
  }
  get color() {
    const color = this.getAttribute("color");
    return toScale16(color);
  }
}
