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

const words = [
  "tree",
  "bear",
  "potato",
  "table",
  "flower",
  "apple",
  "lamp",
  "house",
  "phone",
  "candle",
  "duck",
  "car",
  "bee",
  "dog"
]
const app = express()
const server = new http.Server(app)
const io = new SocketIO.Server(server)
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("connectd")
})

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

enum GameTurnStatuses {
  ENDED = "ENDED",
  ACTIVE = "ACTIVE"
}
const createUser = (id: string, name: string): Player => ({
  id,
  name,
  points: 0,
  guesses: [],
  isReady: false
})

const getRandomPlayer = (game: Game) =>
  Object.values(game.participants)[
    Math.floor(Math.random() * Object.values(game.participants).length)
  ]

const getNextPainter = (game: Game) => {
  if (!game.currentTurn?.painterPlayerId) return getRandomPlayer(game).id
  const lastIndex = Object.values(game.participants).findIndex(
    p => p.id === game.currentTurn?.painterPlayerId
  )
  const nextIndex = lastIndex + 1
  if (nextIndex >= Object.values(game.participants).length - 1) {
    return Object.values(game.participants)[0].id
  } else return Object.values(game.participants)[nextIndex].id
}

const createTurn = (game: Game): GameTurn => ({
  painterPlayerId: getNextPainter(game),
  isPainterReady: false,
  painterWord: words[Math.floor(Math.random() * words.length)],
  correctGuessPlayerIds: [],
  status: GameTurnStatuses.ACTIVE
})
const checkEveryoneReady = (game: Game) => {
  return (
    Object.values(game.participants).every(p => p.isReady) &&
    Object.values(game.participants).length > 1
  )
}
let games: Games = {}
let userToGame: Record<string, string> = {}

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

  // ----------------- WEBRTC STARTS -----------------
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
  // ----------------- WEBRTC ENDS ------------------

  const sendError = (error: string) => socket.emit("error", error)
  const checkGameExist = () => {
    const gameName = getGameName()
    if (!games[gameName]) {
      return false
    }
    return true
  }
  const checkTurnExist = () => {
    return !!(checkGameExist && getGame().currentTurn)
  }
  const emitGame = () => {
    if (!checkGameExist()) return
    emitToRoom("game", getGame())
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
    return guess === game.currentTurn?.painterWord
  }
  socket.on("makeGuess", (guess: string) => {
    const game = getGame()
    if (!game.currentTurn) return
    if (!checkTurnExist()) return
    if (isCorrectGuess(guess)) {
      const player = getPlayer()
      player.points += 1
      game.currentTurn?.correctGuessPlayerIds.push(socket.id)
      if (
        game.currentTurn.correctGuessPlayerIds.length >=
        Object.values(game.participants).length - 1
      ) {
        // io.sockets.emit("roundOver", game.currentTurn?.correctGuessPlayerIds)
        game.currentTurn.status = GameTurnStatuses.ENDED
      }
      emitGame()
      setTimeout(() => {
        const game = getGame()
        game.currentTurn = createTurn(game)
        game.painterIdHistory.push(game.currentTurn.painterPlayerId)
        emitGame()
      }, 5000)
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
    getPlayer().isReady = true
    const shouldGameStart = checkEveryoneReady(game)
    if (shouldGameStart) game.currentTurn = createTurn(game)
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
    emitGame()
  })
  socket.on("joinGame", (opts: JoinGameOptions) => {
    if (!games[opts.gameName]) {
      sendError("Game does not exist")
      return
    }
    if (games[opts.gameName].currentTurn) {
      sendError("Game has already started")
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
    emitGame()
  })

  socket.emit("leaveGame") // for server restarts
  socket.onAny(e => {
    console.info("[server event]", e)
    // console.info("[current game]", getGame())
  })
})
