import { create } from "domain"
import express from "express"
import http from "http"
import * as SocketIO from "socket.io"
import { uuid } from "uuidv4"

import {
  Game,
  Games,
  JoinGameOptions,
  CreateGameOptions,
  Player,
  GameTurn
} from "../../shared"
import { PainterManager } from "./painter-manager"
import { GameTurnStatuses } from "./types"
import { WordGenerator } from "./word-generator"

const app = express()
const server = new http.Server(app)
const io = new SocketIO.Server(server)
const PORT = process.env.PORT || 8000

app.get("/", (_, res) => {
  res.send("connectd")
})
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

const createUser = (id: string, name: string): Player => ({
  id,
  name,
  points: 0,
  guesses: [],
  isReady: false
})

const MS_TURN = 60000

const checkEveryoneReady = (game: Game) => {
  return (
    Object.values(game.participants).every(p => p.isReady) &&
    Object.values(game.participants).length > 1
  )
}

let games: Games = {}
let userToGame: Record<string, string> = {}
let countDownTimeoutId: NodeJS.Timeout | null = null
const wordGenerator = new WordGenerator()
const painterManager = new PainterManager()

io.on("connection", (socket: SocketIO.Socket) => {
  console.log("connection", socket.id)

  const emitToRoom = <T>(channel: string, data?: T) =>
    io.to(getGameName()).emit(channel, data)
  const broadcastToRoom = <T>(channel: string, data?: T) =>
    socket.to(getGameName()).emit(channel, data)
  const removePlayer = () => {
    if (checkGameExist()) delete getGame().participants[socket.id]
    delete userToGame[socket.id]
  }
  const sendError = (error: string) => {
    console.log(`[error]`, error)
    socket.emit("gameError", error)
  }
  const checkGameExist = () => {
    const gameName = getGameName()
    if (!games[gameName]) {
      return false
    }
    return true
  }
  const checkTurnExist = () => {
    return !!(checkGameExist && getGame()?.currentTurn)
  }
  const emitGame = () => {
    if (!checkGameExist()) return
    emitToRoom("game", getGame())
  }
  const createTurn = (game: Game): GameTurn | undefined => {
    if (!game) return
    const newTurn = {
      painterPlayerId: painterManager.getNextPainterId(game),
      isPainterReady: false,
      painterWord: wordGenerator.newWord(),
      correctGuessPlayerIds: [],
      status: GameTurnStatuses.ACTIVE,
      turnEndTS: Date.now() + MS_TURN
    }
    countDownTimeoutId = setTimeout(() => {
      if (newTurn.status === GameTurnStatuses.ENDED) return
      newTurn.status = GameTurnStatuses.ENDED
      emitGame()
      setTimeout(startNewTurn, 5000)
    }, MS_TURN)
    return newTurn
  }
  const removeGame = (name: string) => {
    delete games[name]
  }
  const disconnectUser = () => {
    const game = getGame()
    const gameName = getGameName()
    emitToRoom("disconnectPeer", socket.id)
    socket.leave(gameName)
    if (!checkGameExist()) return
    removePlayer()
    if (!game.participants.length) removeGame(gameName)
    emitGame()
  }
  const getGameName = () => userToGame[socket.id]
  const getGame = () => games[getGameName()]
  const getPlayer = () => getGame()?.participants[socket.id]
  const isCorrectGuess = (guess: string) => {
    const game = getGame()
    if (guess && game.currentTurn?.correctGuessPlayerIds.includes(socket.id))
      return
    return (
      guess.toLocaleLowerCase().trim() ===
      game.currentTurn?.painterWord.toLocaleLowerCase().trim()
    )
  }
  const startNewTurn = () => {
    const game = getGame()
    if (!game) return // some bug causes game not to be defined when game ends and crashes server
    countDownTimeoutId && clearTimeout(countDownTimeoutId)
    countDownTimeoutId = null
    game.currentTurn = createTurn(game)
    if (game.currentTurn?.painterPlayerId) {
      game.painterIdHistory.push(game.currentTurn.painterPlayerId)
    }
    emitGame()
  }
  socket.on("webrtcOffer", (id: string, message: string) => {
    socket.to(id).emit("webrtcOffer", socket.id, message)
  })

  socket.on("webrtcAnswer", (id: string, message: string) => {
    socket.to(id).emit("webrtcAnswer", socket.id, message)
  })

  socket.on("webrtcDisconnectSelf", () => {
    broadcastToRoom("disconnectPeer", socket.id)
    disconnectUser()
    emitGame()
  })

  socket.on("candidate", (id: string, message: string) => {
    socket.to(id).emit("candidate", socket.id, message)
  })

  socket.on("comment", (id: string, message: string) => {
    socket.to(id).emit("comment", socket.id, message)
  })

  socket.on("makeGuess", (guess: string) => {
    const game = getGame()
    if (!game.currentTurn) return
    if (!checkTurnExist()) return
    if (isCorrectGuess(guess)) {
      const player = getPlayer()
      player.points += 1
      game.currentTurn?.correctGuessPlayerIds.push(socket.id)

      // check if all players have guessed correct
      if (
        Object.values(game.participants).length - 1 ===
        game.currentTurn?.correctGuessPlayerIds.length
      ) {
        game.currentTurn.status = GameTurnStatuses.ENDED
        emitGame()
        setTimeout(startNewTurn, 5000)
      }
      return
    }
    game.participants[socket.id].guesses.push({
      id: uuid(),
      text: guess
    })
    emitGame()
  })

  socket.on("leaveGame", disconnectUser)

  socket.on("disconnect", disconnectUser)

  socket.on("markAsReady", () => {
    const game = getGame()
    const player = getPlayer()
    player.isReady = true
    const shouldGameStart = checkEveryoneReady(game)
    if (shouldGameStart && game) game.currentTurn = createTurn(game)
    emitGame()
  })

  socket.on("markPainterAsReady", () => {
    const game = getGame()
    if (!game.currentTurn) {
      sendError("No turn found")
      return
    }
    game.currentTurn.isPainterReady = true //probably dont want isPainterReady
    game.currentTurn.status = GameTurnStatuses.ACTIVE
    emitGame()
  })

  socket.on("createGame", (opts: CreateGameOptions) => {
    if (games[opts.gameName]) {
      sendError("Game already exists")
      return
    }
    socket.join(opts.gameName)
    userToGame[socket.id] = opts.gameName
    games[opts.gameName] = {
      owner: socket.id,
      name: opts.gameName,
      participants: {
        [socket.id]: createUser(socket.id, opts.playerName)
      },
      painterIdHistory: []
    }
    socket.join(opts.gameName)
    socket.emit("playerId", socket.id)
    console.log("Created game", opts.gameName, opts.playerName)
    emitGame()
  })

  socket.on("joinGame", (opts: JoinGameOptions) => {
    if (!games[opts.gameName]) {
      sendError(
        "Game does not exist. Try creating it by pressing 'Create Game' and invite your friends!"
      )
      return
    }
    if (games[opts.gameName]?.currentTurn) {
      sendError(
        "This game has already started. Try creating a new one, or join another game!"
      )
      return
    }
    socket.join(opts.gameName)
    userToGame[socket.id] = opts.gameName
    games[opts.gameName].participants[socket.id] = createUser(
      socket.id,
      opts.playerName
    )
    socket.join(opts.gameName)
    socket.emit("playerId", socket.id)
    broadcastToRoom("webrtcWatcher", socket.id)
    console.log("Joined game", opts.gameName, opts.playerName)
    emitGame()
  })

  socket.emit("leaveGame") // for server restarts
  socket.on("error", e => {
    console.info("[server default error]", e)
  })
  socket.on("clientInfo", e => {
    console.info("[info]", e, "   |  ", socket.id)
  })
  socket.onAny(e => {
    console.info("[server event]", e)
  })
})
