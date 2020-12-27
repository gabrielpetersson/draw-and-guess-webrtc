export interface Guess {
  id: string
  text: string
}

export interface Player {
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
  status: "ENDED" | "ACTIVE" // not a type due some transpilation bugs
}

export interface Game {
  owner: string
  name: string
  participants: Record<string, Player>
  currentTurn?: GameTurn
  painterIdHistory: string[]
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
