import React from "react"
import {
  Animated,
  Dimensions,
  PanResponder,
  PanResponderInstance
} from "react-native"
import Canvas from "react-native-canvas"

interface Point {
  x: number
  y: number
}
type Line = Point[]
interface LineHandler {
  endLine: () => void
  createNewLine: () => void
  addNewPoint: (point: Point) => void
  lines: Line[]
}
const useLines = (): LineHandler => {
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

const createPanResponder = ({
  endLine,
  createNewLine,
  addNewPoint
}: {
  endLine: () => void
  createNewLine: () => void
  addNewPoint: (point: Point) => void
}) => {
  return PanResponder.create({
    onMoveShouldSetPanResponder: () => {
      return true
    },
    onPanResponderGrant: e => {
      createNewLine()
    },
    onPanResponderMove: e => {
      addNewPoint({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })
    },
    onPanResponderRelease: (_, gest) => {
      endLine()
    }
  })
}

export const drawLinesToCanvas = ({
  canvas,
  lines,
  lineWidth = 5
}: {
  canvas: Canvas
  lines: Line[]
  lineWidth?: number
}) => {
  const ctx = canvas.getContext("2d")
  if (!lines.length) return
  const endOfLine = lines[lines.length - 1].slice(-3)
  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  endOfLine.forEach((point, i, points) => {
    if (!i) ctx.moveTo(point.x, point.y)
    else if (i < 3) ctx.lineTo(point.x, point.y)
    else if (i % 2 !== 0)
      ctx.bezierCurveTo(
        points[i - 2].x,
        points[i - 2].y,
        points[i - 1].x,
        points[i - 1].y,
        point.x,
        point.y
      )
  })
  ctx.strokeStyle = "black"
  ctx.stroke()
  // if (lines.length && ctx) {
  //   lines.forEach(line => {
  //     ctx.beginPath()
  //     ctx.lineWidth = lineWidth
  //     ctx.lineCap = "round"
  //     ctx.lineJoin = "round"
  //     line.forEach((point, i, points) => {
  //       if (!i) ctx.moveTo(point.x, point.y)
  //       else if (i < 3) ctx.lineTo(point.x, point.y)
  //       else if (i % 2 !== 0)
  //         ctx.bezierCurveTo(
  //           points[i - 2].x,
  //           points[i - 2].y,
  //           points[i - 1].x,
  //           points[i - 1].y,
  //           point.x,
  //           point.y
  //         )
  //     })
  //     ctx.strokeStyle = "black"
  //     ctx.stroke()
  //   })
  // }
}

export const GameCanvas = () => {
  const [canvas, setCanvas] = React.useState<Canvas | null>(null)
  const [
    panResponder,
    setPanResponder
  ] = React.useState<PanResponderInstance | null>(null)
  const { endLine, createNewLine, addNewPoint, lines } = useLines()

  React.useEffect(() => {
    setPanResponder(createPanResponder({ endLine, createNewLine, addNewPoint }))
  }, [endLine, createNewLine, addNewPoint])

  React.useEffect(() => {
    if (!canvas) return
    drawLinesToCanvas({ canvas, lines })
  }, [lines, canvas])

  return (
    <Animated.View
      {...panResponder?.panHandlers}
      style={{
        backgroundColor: "yellow",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").width
      }}
      // pointerEvents="none"
    >
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "blue"
        }}
        width={Dimensions.get("window").width}
        height={Dimensions.get("window").width}
        ref={(c: Canvas) => {
          if (!c || canvas) return
          c.width = Dimensions.get("window").width
          c.height = Dimensions.get("window").height
          setCanvas(c)
        }}
      />
    </Animated.View>
  )
}
