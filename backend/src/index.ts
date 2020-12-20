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
  // ----------------- WEBRTC ENDS ------------------
  const checkGameExist = (gameName: string) => {
    if (!games[gameName]) {
      console.log("NO GAME", gameName)
      socket.emit("error", "No game found")
      return false
    }
    return true
  }
  const emitGame = (gameName: string) => {
    if (!checkGameExist(gameName)) return
    io.to(gameName).emit("game", games[gameName])
  }
  const removeUser = () => {
    const gameName = userToGame[socket.id]
    if (checkGameExist(gameName)) delete games[gameName].participants[socket.id]
    delete userToGame[socket.id]
  }
  const disconnectUser = () => {
    console.log("LEAAFFFFFFE")
    const gameName = userToGame[socket.id]
    socket.leave(gameName)
    if (!checkGameExist(gameName)) return
    removeUser()
    emitGame(gameName)
  }
  socket.on("makeGuess", (guess: string) => {
    const gameName = userToGame[socket.id]
    if (!checkGameExist(gameName)) return
    games[gameName].participants[socket.id].guesses.push({
      id: uuid(),
      text: guess
    })
    console.log("make guess", guess)
    emitGame(gameName)
  })
  socket.on("leaveGame", disconnectUser)
  socket.on("disconnect", disconnectUser)
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
    console.log("create room", games[opts.gameName])
    emitGame(opts.gameName)
  })
  socket.on("joinGame", (opts: JoinGameOptions) => {
    socket.join(opts.gameName)
    userToGame[socket.id] = opts.gameName
    if (!checkGameExist(opts.gameName)) return
    games[opts.gameName].participants[socket.id] = createUser(
      socket.id,
      opts.playerName
    )
    socket.join(opts.gameName)
    console.log("joined room", games[opts.gameName])
    emitGame(opts.gameName)
  })

  socket.emit("leaveGame") // for server restarts
})
