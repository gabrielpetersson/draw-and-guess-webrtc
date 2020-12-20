import React from "react"
import { RTCPeerConnection, RTCIceCandidate } from "react-native-webrtc"
import { io, Socket } from "socket.io-client/build/index"
import { CreateGameOptions, Game, JoinGameOptions, User } from "../../shared"

const config = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] }

export const useWebRTC = () => {
  const [error, setError] = React.useState("")
  const peerConnections = React.useRef<Map<string, RTCPeerConnection>>(
    new Map()
  )
  const [game, setGame] = React.useState<Game | null>(null)
  const [socket, setSocket] = React.useState<Socket | null>(null)
  React.useEffect(() => {
    const socket = io("ws://192.168.8.100:8000")
    socket.on("connect", () => {
      console.log("connected")
      // socket.emit("broadcaster")
      // socket.on("broadcaster", () => console.log("broadcaster"))

      socket.on("watcher", async (id: string) => {
        const connectionBuffer = new RTCPeerConnection(config)
        // const dataChannel = connectionBuffer.createDataChannel("sendChannel")
        // dataChannel.onopen = (d: any) => console.log(d)
        // dataChannel.onclose = (d: any) => console.log(d)

        connectionBuffer.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit("candidate", id, candidate)
        }

        const localDescription = await connectionBuffer.createOffer()
        await connectionBuffer.setLocalDescription(localDescription)
        socket.emit("offer", id, connectionBuffer.localDescription)
        peerConnections.current.set(id, connectionBuffer)
      })

      socket.on("candidate", (id: string, candidate: any) => {
        const candidateBuffer = new RTCIceCandidate(candidate as any)
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        connectionBuffer.addIceCandidate(candidateBuffer)
      })

      socket.on("answer", (id: string, remoteOfferDescription: any) => {
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        connectionBuffer.setRemoteDescription(remoteOfferDescription)
      })

      socket.on("disconnectPeer", (id: string) => {
        if (!peerConnections.current) return
        peerConnections.current.get(id)?.close()
        peerConnections.current.delete(id)
      })

      socket.on("game", (game: Game) => {
        setGame(game)
      })

      socket.on("leaveGame", () => {
        setGame(null)
      })

      socket.on("error", (error: string) => {
        setError(error)
      })
      socket.on("disconnect", () => setGame(null))
    })

    setSocket(socket)
    return () => {
      if (socket.connected) socket.close()
    }
  }, [])

  return {
    createGame: (gameName: string, playerName: string) => {
      const createGameOptions: CreateGameOptions = { gameName, playerName }
      socket?.emit("createGame", createGameOptions)
    },
    joinGame: (gameName: string, playerName: string) => {
      const joinGameOptions: JoinGameOptions = { gameName, playerName }
      socket?.emit("joinGame", joinGameOptions)
    },
    makeGuess: (guess: string) => {
      socket?.emit("makeGuess", guess)
    },
    game,
    error,
    leaveGame: () => {
      socket?.emit("leaveGame")
      setGame(null)
    }
  }
}
