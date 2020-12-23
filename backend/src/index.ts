import express from "express"
import http from "http"
import * as SocketIO from "socket.io"
import { uuid } from "uuidv4"

import {
  Game,
  Games,
  JoinGameOptions,
  CreateGameOptions,
  User
} from "../../shared"

const words = ["tree", "fotball", "potato", "table"]
const app = express()
const server = new http.Server(app)
const io = new SocketIO.Server(server)
const port = 8000

app.get("/", (req, res) => {
  res.send("connectd")
})

io.sockets.on("error", e => console.log(e))
server.listen(port, () => console.log(`Server is running on port ${port}`))

const createUser = (id: string, name: string): User => ({
  id,
  name,
  points: 0,
  guesses: [],
  isReady: false
})
const createTurn = (game: Game) => ({
  painterPlayerId: Object.values(game.participants)[
    Math.floor(Math.random() * Object.values(game.participants).length)
  ].id,
  isPainterReady: false,
  painterWord: words[Math.floor(Math.random() * words.length)],
  correctGuessPlayerIds: []
})
const checkEveryoneReady = (game: Game) => {
  return Object.values(game.participants).every(p => p.isReady)
}
let broadcaster = ""
let games: Games = {}
let userToGame: Record<string, string> = {}

io.on("connection", (socket: SocketIO.Socket) => {
  // ----------------- WEBRTC STARTS -----------------
  console.log("connection", socket.id)
  // socket.on("broadcaster", () => {
  //   console.log("BROADSTER", socket.id)
  //   broadcaster = socket.id
  //   socket.broadcast.emit("broadcaster")
  // })
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id)
  })
  // socket.on("disconnect", () => {
  //   console.log("DISCONNEDRED", socket.id)
  //   socket.to(broadcaster).emit("disconnectPeer", socket.id)
  // })
  socket.on("webrtcOffer", (id: string, message: string) => {
    socket.to(id).emit("webrtcOffer", socket.id, message)
  })
  socket.on("webrtcAnswer", (id: string, message: string) => {
    socket.to(id).emit("answer", socket.id, message)
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
  const emitToRoom = <T>(channel: string, data: T) =>
    io.to(getGameName()).emit(channel, data)
  const emitGame = () => {
    if (!checkGameExist()) return
    emitToRoom("game", getGame())
  }
  const removeUser = () => {
    if (checkGameExist()) delete getGame().participants[socket.id]
    delete userToGame[socket.id]
  }
  const removeGame = () => {
    if (!checkGameExist()) return
    delete games[getGameName()]
  }
  const disconnectUser = () => {
    const game = getGame()
    const gameName = getGameName()
    socket.leave(gameName)
    if (!checkGameExist()) return
    removeUser()
    if (!game.participants.length) removeGame()
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
    if (!checkTurnExist()) return
    if (isCorrectGuess(guess)) {
      const player = getPlayer()
      player.points += 1
      game.currentTurn?.correctGuessPlayerIds.push(socket.id)
      emitGame()
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
    game.currentTurn.isPainterReady = true
    emitGame()
  })
  socket.on("createGame", (opts: CreateGameOptions) => {
    socket.join(opts.gameName)
    userToGame[socket.id] = opts.gameName
    games[opts.gameName] = {
      owner: socket.id,
      name: opts.gameName,
      participants: {
        [socket.id]: createUser(socket.id, opts.playerName)
      }
    }
    socket.join(opts.gameName)
    socket.emit("playerId", socket.id)
    emitGame()
  })
  socket.on("joinGame", (opts: JoinGameOptions) => {
    socket.join(opts.gameName)
    userToGame[socket.id] = opts.gameName
    if (!checkGameExist()) return
    games[opts.gameName].participants[socket.id] = createUser(
      socket.id,
      opts.playerName
    )
    socket.join(opts.gameName)
    socket.emit("playerId", socket.id)
    socket.broadcast.emit("webrtcWatcher", socket.id)
    emitGame()
  })

  socket.emit("leaveGame") // for server restarts
  socket.onAny(e => {
    console.info("[new event]", e)
    // console.info("[current game]", getGame())
  })
})
