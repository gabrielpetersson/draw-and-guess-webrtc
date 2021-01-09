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
    let newPainter = this.getRandomPlayer(game)
    while (this.previousPainterIds.includes(newPainter.id)) {
      newPainter = this.getRandomPlayer(game)
      if (
        this.previousPainterIds.length ===
        Object.values(game.participants).length
      )
        this.previousPainterIds = []
    }
    this.previousPainterIds.push(newPainter.id)
    return newPainter.id
  }
}
