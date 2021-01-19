import { Game } from "../../shared"

export class PainterManager {
  previousPainterIds: string[]
  constructor() {
    this.previousPainterIds = []
  }
  private getRandomPlayer = (game: Game) => {
    const participants = Object.values(game.participants)
    return participants[Math.floor(Math.random() * participants.length)]
  }
  getNextPainterId = (game: Game) => {
    let count = 0
    let newPainter = this.getRandomPlayer(game)
    const participants = Object.values(game.participants)
    while (this.previousPainterIds.includes(newPainter.id)) {
      count++
      newPainter = this.getRandomPlayer(game)
      if (this.previousPainterIds.length === participants.length) {
        this.previousPainterIds = []
      }
      if (count > 100) {
        console.log("server error: infinite get random painter id loop")
        this.previousPainterIds = []
        newPainter = this.getRandomPlayer(game)
        break
      }
    }
    this.previousPainterIds.push(newPainter.id)
    return newPainter.id
  }
}
