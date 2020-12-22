import React from "react"
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescriptionType,
  registerGlobals
} from "react-native-webrtc"
import { io, Socket } from "socket.io-client/build/index"
import { CreateGameOptions, Game, JoinGameOptions } from "../../shared"

registerGlobals()
const config = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] }

export const useWebRTC = () => {
  const [error, setError] = React.useState("")
  const [localPlayerId, setLocalPlayerId] = React.useState("")
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

      socket.on("webrtcWatcher", async (id: string) => {
        console.log("INITING LOCAL", id)
        const localConnection = new RTCPeerConnection(config)
        console.log("created localcon", localConnection)
        const dataChannel = localConnection.createDataChannel("sendChannel")
        console.log("DC", dataChannel)
        dataChannel.onopen = (d: any) => console.log("OPEN", d)
        dataChannel.onclose = (d: any) => console.log(d)

        localConnection.onicecandidate = ({ candidate }) => {
          console.log("GOT CANDIDATE2", candidate)
          if (candidate) socket.emit("candidate", id, candidate)
        }

        const localDescription = await localConnection.createOffer()
        await localConnection.setLocalDescription(localDescription)
        socket.emit("webrtcOffer", id, localConnection.localDescription)
        peerConnections.current.set(id, localConnection)
      })

      socket.on(
        "webrtcOffer",
        async (id: string, offer: RTCSessionDescriptionType) => {
          console.log("got offer", offer)
          const localConnection = new RTCPeerConnection(config)
          localConnection.onicecandidate = ({ candidate }) => {
            console.log("GOT CANDIDATE", candidate)
            if (candidate) socket.emit("candidate", id, candidate)
          }

          await localConnection.setRemoteDescription(offer)
          const localDescription = await localConnection.createAnswer()
          socket.emit("webrtcAnswer", id, localDescription)
        }
      )

      socket.on("candidate", (id: string, candidate: any) => {
        const candidateBuffer = new RTCIceCandidate(candidate as any)
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        connectionBuffer.addIceCandidate(candidateBuffer)
      })

      socket.on("answer", (id: string, remoteOfferDescription: any) => {
        const localConnection = peerConnections.current.get(id)
        if (!localConnection) return
        localConnection.setRemoteDescription(remoteOfferDescription)
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
        console.log("GOT ERROR", error)
        setError(error)
      })
      socket.on("disconnect", () => setGame(null))
      socket.on("playerId", setLocalPlayerId)
      socket.onAny(e => console.log("[event]", e))
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
    localPlayerId,
    leaveGame: () => {
      socket?.emit("leaveGame")
      setGame(null)
    },
    markAsReady: () => {
      socket?.emit("markAsReady")
    },
    markPainterAsReady: () => {
      socket?.emit("markPainterAsReady")
    }
  }
}
