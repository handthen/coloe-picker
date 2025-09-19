export const RgbReg = /^rgb[a]?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),?\s?(.*)?\)/;
export const B16Reg =
  /^#([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})?/;
export function toScale16(str) {
  if (!str) return str;
  if (str[0] == "#") return str;
  const match = str
    .match(RgbReg)
    ?.slice(1, 5)
    .reduce((t, c) => {
      if (c) {
        let s = Number(c).toString(16);
        s = s.length == 1 ? "0" + s : s;
        t += s;
      }
      return t;
    }, "#");

  return match;
}

export function toRgb(str) {
  if (!str || str.indexOf("rgb") != -1) return str;
  const matchColor = str.match(B16Reg)?.slice(1, 5) ?? [];
  const RgbVal = matchColor
    .reduce((t, c, i) => {
      if (c) {
        const s = parseInt(c, 16);
        t += s + ",";
      }
      return t;
    }, "")
    .slice(0, -1);

  const Rgb = matchColor[3] ? "rgba" : "rgb";
  return Rgb + "(" + RgbVal + ")";
}

export function rgbaToRgb(r, g, b, a, bg = [255, 255, 255]) {
  const r2 = Math.round(r * a + bg[0] * (1 - a));
  const g2 = Math.round(g * a + bg[1] * (1 - a));
  const b2 = Math.round(b * a + bg[2] * (1 - a));
  return `rgb(${r2}, ${g2}, ${b2})`;
}
