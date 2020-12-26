import React from "react"

export interface Point {
  x: number
  y: number
}
export type Line = Point[]
export interface LineHandler {
  endLine: () => void
  createNewLine: () => void
  addNewPoint: (point: Point) => void
  lines: Line[]
}
export const useLines = (): LineHandler => {
  const [lines, setLines] = React.useState([] as Line[])

  const createNewLine = React.useCallback(() => {
    setLines(prevLines => [...prevLines, []])
  }, [])
  const addNewPoint = React.useCallback((point: Point) => {
    setLines(lines => [
      ...lines.slice(0, lines.length - 1),
      [...lines[lines.length - 1], point]
    ])
  }, [])
  const endLine = React.useCallback(() => {}, [])
  return { endLine, createNewLine, addNewPoint, lines }
}
