import ColorPicker from "./template/color-picker.js";

const NAME = "upto-color-picker";

if (typeof window != undefined) {
  window.customElements.define(NAME, ColorPicker);
  //   window.customElements
  //     .whenDefined(NAME)
  //     .then(() => {})
  //     .catch((err) => {
  //       console.log(err);
  //     });
}

export default ColorPicker;
