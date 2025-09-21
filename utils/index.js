export const RgbReg =
  /^rgb[a]?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),?\s?(.*)?\)/
export const B16Reg =
  /^#([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})?/
export function toScale16(str) {
  if (!str) return str
  if (str[0] == "#") return str
  const match = str.match(RgbReg)
  if (!match) return str
  const color = match.slice(1, 5).reduce((t, c, i) => {
    if (c) {
      if (i == 3) {
        c = Math.floor(c * 255)
      }
      let s = Number(c).toString(16)
      s = s.length == 1 ? "0" + s : s

      t += s
    }
    return t
  }, "#")

  return color
}

export function toRgb(str) {
  if (!str || str.indexOf("rgb") != -1) return str
  const matchColor = str.match(B16Reg)?.slice(1, 5) ?? []
  if (!matchColor) return str
  const RgbVal = matchColor
    .reduce((t, c, i) => {
      if (c) {
        let s = parseInt(c, 16)
        if (i == 3) {
          s = +Number(s / 255).toFixed(2)
        }
        t += s + ","
      }
      return t
    }, "")
    .slice(0, -1)

  return "rgb" + "(" + RgbVal + ")"
}

export function rgbaToRgb(r, g, b, a, bg = [255, 255, 255]) {
  const r2 = Math.round(r * a + bg[0] * (1 - a))
  const g2 = Math.round(g * a + bg[1] * (1 - a))
  const b2 = Math.round(b * a + bg[2] * (1 - a))
  return `rgb(${r2}, ${g2}, ${b2})`
}

export function nextTick(execute, context) {
  
}
