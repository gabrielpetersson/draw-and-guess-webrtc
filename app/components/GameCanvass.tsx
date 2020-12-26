import React from "react"
import {
  Animated,
  Dimensions,
  PanResponder,
  PanResponderInstance
} from "react-native"
import Canvas from "react-native-canvas"
import { Line, LineHandler, Point, useLines } from "../lib/useLines"

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
}

interface GameCanvaProps {
  lineHandler: LineHandler
  sendPoint: (p: Point) => void
}
export const GameCanvas = ({ lineHandler, sendPoint }: GameCanvaProps) => {
  const [canvas, setCanvas] = React.useState<Canvas | null>(null)
  const [
    panResponder,
    setPanResponder
  ] = React.useState<PanResponderInstance | null>(null)

  const { endLine, createNewLine, addNewPoint, lines } = lineHandler

  React.useEffect(() => {
    setPanResponder(
      createPanResponder({
        endLine,
        createNewLine,
        addNewPoint: (p: Point) => {
          addNewPoint(p)
          sendPoint(p)
        }
      })
    )
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
        // @ts-ignore - width and height indeed does exist here.
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
