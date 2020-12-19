import React from "react"
import { Dimensions } from "react-native"
import Canvas from "react-native-canvas"

export const GameCanvas = () => {
  const [canvas, setCanvas] = React.useState()
  return (
    <Canvas
      width={Dimensions.get("screen").width}
      height={Dimensions.get("screen").width * 1.4} // 1.4 means all canvases will have the exact same ratio. easy to transfer lines
      ref={canvas => setCanvas(canvas)}
    />
  )
}

// PanResponder.create({
//   onMoveShouldSetPanResponder: () => true,
//   onPanResponderGrant: e => {
//     animation.setOffset({
//       x: animation.x._value,
//       y: animation.y._value
//     })
//   },
//   onPanResponderMove: (_, gest) => {
//     if (gest.moveX > 200) {
//     }
//     const dx = Math.pow(Math.abs(gest.dx), 0.86) * (gest.dx < 0 ? -1 : 1)
//     animation.x.setValue(dx)
//     popup.setValue(Math.min(3, Math.max(0, (Math.abs(dx) - 45) / 120)))
//   },
//   onPanResponderRelease: (_, gest) => {
//     const s = getStrength(gest.dx / Dimensions.get("window").width)
//     const duration = 300 * (s >= 1 || s <= -1 ? 0.7 : 1)
//     const shouldRemove = s >= 1 || s <= -1
//     shouldRemove && playSound()
//     slangbella(
//       animation,
//       -(s * Dimensions.get("window").width),
//       duration,
//       shouldRemove
//     )
//     popup.setValue(0)
//     if (!shouldRemove) return
//     setTimeout(() => removeRecipe(recipeIndex), duration)
//     animation.flattenOffset()
//   }
// })

// export const drawLinesToCanvas = ({
//   canvas,
//   lines,
//   lineWidth = 5
// }: IDrawLinesToCanvas) => {
//   const ctx = canvas.getContext("2d")
//   if (lines.length && ctx) {
//     lines.forEach(line => {
//       ctx.beginPath()
//       ctx.lineWidth = lineWidth
//       ctx.lineCap = "round"
//       ctx.lineJoin = "round"
//       line.points.forEach((point, i, points) => {
//         if (!i) ctx.moveTo(point.x, point.y)
//         else if (i < 3) ctx.lineTo(point.x, point.y)
//         else if (i % 2 !== 0)
//           ctx.bezierCurveTo(
//             points[i - 2].x,
//             points[i - 2].y,
//             points[i - 1].x,
//             points[i - 1].y,
//             point.x,
//             point.y
//           )
//       })
//       ctx.strokeStyle = LineOptions.color
//       ctx.stroke()
//     })
//   }
//   return canvas
// }
