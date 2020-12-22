export interface Guess {
  id: string
  text: string
}

export interface User {
  id: string
  name: string
  points: number
  guesses: Guess[]
  isReady: boolean
}

export interface GameTurn {
  painterPlayerId: string
  isPainterReady: boolean
  painterWord: string
  correctGuessPlayerIds: string[]
}

export interface Game {
  owner: string
  name: string
  participants: Record<string, User>
  currentTurn?: GameTurn
}

export interface CreateGameOptions {
  gameName: string
  playerName: string
}

export interface JoinGameOptions {
  gameName: string
  playerName: string
}

export type Games = Record<string, Game>
