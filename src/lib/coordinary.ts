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

export interface WindowRect { left: number; top: number; right: number; bottom: number; }

export const getSize = (winRect: WindowRect, width: number, height: number) => {
  const ratio = (winRect.right - winRect.left) / (winRect.bottom - winRect.top)
  // windowの方がブラウザと比べて横に長い場合
  if (ratio > (width / height)) {
    return {
      width: width,
      height: width / ratio,
      expr: (winRect.right - winRect.left) / width
    }
  }
  return {
    width: ratio * height,
    height: height,
    expr: (winRect.bottom - winRect.top) / height
  }
}
