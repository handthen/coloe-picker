import UptoColorPicker from "./template/index.js";

const NAME = "upto-color-picker";

if (typeof window != undefined) {
  window.customElements.define(NAME, UptoColorPicker);
}

export default UptoColorPicker;
