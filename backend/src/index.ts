import express from "express"
import http from "http"
import * as SocketIO from "socket.io"

import {
  Game,
  Games,
  JoinGameOptions,
  CreateGameOptions,
  User
} from "../../shared"

const app = express()
const server = new http.Server(app)
const io = new SocketIO.Server(server)
const port = 8000

app.get("/", (req, res) => {
  res.send("l,onis luktar")
})

io.sockets.on("error", e => console.log(e))
server.listen(port, () => console.log(`Server is running on port ${port}`))

const createUser = (id: string, name?: string): User => ({
  id,
  name: name ?? Math.floor(Math.random() * 1000).toString(),
  points: 0,
  guesses: []
})

let broadcaster = ""
let games: Games = {}
let userToGame: Record<string, string> = {}

console.log("LOG")
io.on("connection", (socket: SocketIO.Socket) => {
  console.log("connection", socket.id)
  // socket.on("broadcaster", () => {
  //   console.log("BROADSTER", socket.id)
  //   broadcaster = socket.id
  //   socket.broadcast.emit("broadcaster")
  // })
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id)
  })
  socket.on("disconnect", () => {
    console.log("DISCONNEDRED", socket.id)
    socket.to(broadcaster).emit("disconnectPeer", socket.id)
  })
  socket.on("offer", (id: string, message: string) => {
    socket.to(id).emit("offer", socket.id, message)
  })
  socket.on("answer", (id: string, message: string) => {
    socket.to(id).emit("answer", socket.id, message)
  })
  socket.on("candidate", (id: string, message: string) => {
    socket.to(id).emit("candidate", socket.id, message)
  })
  socket.on("comment", (id: string, message: string) => {
    socket.to(id).emit("comment", socket.id, message)
  })
  const checkGameExist = (gameName: string) => {
    if (!games[gameName]) {
      console.log("NO GAME", gameName)
      socket.emit("error", "No game for guess")
      return false
    }
    return true
  }
  const emitGame = (gameName: string) => {
    if (!checkGameExist(gameName)) return
    io.sockets.emit("game", games[gameName])
  }
  socket.on("makeGuess", (guess: string) => {
    const gameName = userToGame[socket.id]
    if (!checkGameExist(gameName)) return
    games[gameName].participants[socket.id].guesses.push(guess)
    console.log("make guess", guess)
    emitGame(gameName)
  })
  socket.on("leaveGame", () => {
    const gameName = userToGame[socket.id]
    if (checkGameExist(gameName)) delete games[gameName].participants[socket.id]
    delete userToGame[socket.id]
    emitGame(gameName)
  })
  socket.on("createGame", (createGameOpts: CreateGameOptions) => {
    // socket.join(createGameOpts.gameName)
    userToGame[socket.id] = createGameOpts.gameName
    games[createGameOpts.gameName] = {
      owner: socket.id,
      participants: {
        [socket.id]: createUser(socket.id, createGameOpts.playerName)
      }
    }
    socket.join(createGameOpts.gameName)
    console.log("create room", games[createGameOpts.gameName])
    emitGame(createGameOpts.gameName)
  })
  socket.on("joinGame", (joinGameOpts: JoinGameOptions) => {
    userToGame[socket.id] = joinGameOpts.gameName
    if (!checkGameExist(joinGameOpts.gameName)) return
    games[joinGameOpts.gameName].participants[socket.id] = createUser(
      socket.id,
      joinGameOpts.playerName
    )
    socket.join(joinGameOpts.gameName)
    console.log("joined room", games[joinGameOpts.gameName])
    emitGame(joinGameOpts.gameName)
  })

  socket.emit("leaveGame") // for server restarts
})
