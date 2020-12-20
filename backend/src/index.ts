import express from "express"
import http from "http"
import * as SocketIO from "socket.io"

const app = express()
const server = new http.Server(app)
const io = new SocketIO.Server(server)
const port = 8000

app.get("/", (req, res) => {
  res.send("l,onis luktar")
})

io.sockets.on("error", e => console.log(e))
server.listen(port, () => console.log(`Server is running on port ${port}`))

interface NewGameOptions {
  roomName: string
  name: string
}
interface JoinGameOptions {
  roomName: string
  name: string
}
interface User {
  id: string
  name?: string
  points: number
}
interface Game {
  owner: string
  currentTurnIndex?: number
  participants: Record<string, User>
}

const createUser = (id: string, name?: string): User => ({
  id,
  name: name ?? Math.floor(Math.random() * 1000).toString(),
  points: 0
})
type Games = Record<string, Game>
let broadcaster = ""
let games: Games = {}
console.log("LOG")
io.on("connection", (socket: SocketIO.Socket) => {
  console.log("connection")
  socket.on("broadcaster", () => {
    broadcaster = socket.id
    socket.broadcast.emit("broadcaster")
  })
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id)
  })
  socket.on("disconnect", () => {
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
  socket.on("createGame", (newGame: NewGameOptions) => {
    console.log("creatre", newGame)
    games[newGame.roomName] = {
      owner: socket.id,
      participants: { [socket.id]: createUser(socket.id, newGame.name) }
    }
    socket.emit("game", games[newGame.roomName])
  })
  socket.on("joinGame", (joinGame: JoinGameOptions) => {
    if (!games[joinGame.roomName]) {
      socket.emit("error", "No room ")
      return
    }
    games[joinGame.roomName].participants[socket.id] = createUser(
      socket.id,
      joinGame.name
    )
    socket.emit("game", games[joinGame.roomName])
  })
})
