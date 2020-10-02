import type { Rect } from "../components/Tablet/useSetting"

export const getNumRect = (rect: Rect) => {
  return {
    x: conversionPX(rect.start.x, window?.innerWidth),
    y: conversionPX(rect.start.y, window?.innerHeight),
    width: conversionPX(rect.width, window?.innerWidth),
    height: conversionPX(rect.height, window?.innerHeight)
  }
}

const conversionPX = (str: string, base?: number) => {
  if (str.endsWith('px')) {
    return Number(str.replace('px', ''))
  }
  if (str.endsWith('%')) {
    if (!base) return 500
    return base * Number(str.replace('%', '')) / 100
  }
  return 0
}
