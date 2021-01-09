import { Game } from "../../shared"

export class PainterManager {
  previousPainterIds: string[]
  constructor() {
    this.previousPainterIds = []
  }
  private getRandomPlayer = (game: Game) => {
    return Object.values(game.participants)[
      Math.floor(Math.random() * Object.values(game.participants).length)
    ]
  }
  getNextPainterId = (game: Game) => {
    let count = 0
    let newPainter = this.getRandomPlayer(game)
    while (this.previousPainterIds.includes(newPainter.id)) {
      count++
      newPainter = this.getRandomPlayer(game)
      if (
        this.previousPainterIds.length ===
        Object.values(game.participants).length
      ) {
        this.previousPainterIds = []
      }
      if (count > 100) throw new Error("infinite get random painter id loop")
    }
    this.previousPainterIds.push(newPainter.id)
    return newPainter.id
  }
}
