export const RgbReg = /^rgb[a]?\((\d{1,3}),(\d{1,3}),(\d{1,3}),?(.*)?\)/;
export const B16Reg =
  /^#([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})?/;
export function toScale16(str) {
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
