import React from "react"
import { Animated, PanResponder, PanResponderInstance } from "react-native"
import Canvas from "react-native-canvas"
import { getCanvasSize } from "../lib/canvasSize"
import { BORDER_COLOR } from "../lib/constants"
import { Line, LineHandler, Point } from "../lib/useLines"
import { IWebRTCLineHandler } from "../requests/setupWebRTC"

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
    onPanResponderGrant: () => {
      createNewLine()
    },
    onPanResponderMove: e => {
      addNewPoint({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })
    },
    onPanResponderRelease: () => {
      endLine()
    }
  })
}

export const drawLinesToCanvas = ({
  canvas,
  lines
}: {
  canvas: Canvas
  lines: Line[]
}) => {
  const ctx = canvas.getContext("2d")
  if (!lines.length) return
  const endOfLine = lines[lines.length - 1].slice(-3)
  ctx.beginPath()
  ctx.lineWidth = 3
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
  webRTCLineHandler: IWebRTCLineHandler
  isPainter: boolean
}
export const GameCanvas = ({
  lineHandler,
  webRTCLineHandler,
  isPainter
}: GameCanvaProps) => {
  const [canvas, setCanvas] = React.useState<Canvas | null>(null)
  const [
    panResponder,
    setPanResponder
  ] = React.useState<PanResponderInstance | null>(null)

  const { endLine, createNewLine, addNewPoint, lines } = lineHandler
  React.useEffect(() => {
    if (!isPainter) return // only allow for current painter to paint
    setPanResponder(
      createPanResponder({
        endLine,
        createNewLine: () => {
          createNewLine()
          webRTCLineHandler.sendNewLine()
        },
        addNewPoint: (p: Point) => {
          addNewPoint(p)
          webRTCLineHandler.sendPoint(p)
        }
      })
    )
  }, [endLine, createNewLine, addNewPoint])

  React.useEffect(() => {
    if (!canvas) return
    drawLinesToCanvas({ canvas, lines })
  }, [lines, canvas])

  const canvasSize = getCanvasSize()
  return (
    <Animated.View
      {...panResponder?.panHandlers}
      style={{
        width: canvasSize,
        height: canvasSize
      }}
    >
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          borderWidth: 1,
          backgroundColor: "white",
          borderRadius: 4,
          borderColor: isPainter ? BORDER_COLOR : "transparent"
        }}
        // @ts-ignore - width and height indeed does exist here.
        width={canvasSize}
        height={canvasSize}
        ref={(c: Canvas) => {
          if (!c || canvas) return
          c.width = canvasSize
          c.height = canvasSize
          setCanvas(c)
        }}
      />
    </Animated.View>
  )
}
