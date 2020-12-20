export interface Guess {
  id: string
  text: string
}

export interface User {
  id: string
  name?: string
  points: number
  guesses: Guess[]
}

export interface Game {
  owner: string
  name: string
  currentTurnIndex?: number
  participants: Record<string, User>
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
