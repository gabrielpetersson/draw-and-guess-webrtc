import React from "react"
import {
  RTCPeerConnection,
  RTCIceCandidate
  // RTCSessionDescriptionType
} from "react-native-webrtc"
import { io } from "socket.io-client/build/index"

const config = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] }
// const pc = new RTCPeerConnection(configuration)

export interface User {
  id: string
  name?: string
  points: number
}
export interface Game {
  owner: string
  currentTurnIndex?: number
  participants: Record<string, User>
}

export const useWebRTC = ({
  setError
}: {
  setError: (error: string) => void
}) => {
  console.log("INIT")
  const peerConnections = React.useRef<Map<string, RTCPeerConnection>>(
    new Map()
  )
  const socket = React.useRef(io("ws://192.168.8.100:8000")).current
  const [game, setGame] = React.useState<Game | null>(null)
  React.useEffect(() => {
    console.log("trying...")
    socket.on("connect", () => {
      console.log("connected")
      socket.emit("broadcaster")
      socket.on("broadcaster", () => console.log("broadcaster"))

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
    })

    return () => {
      if (socket.connected) socket.close()
    }
  }, [socket])

  return {
    createGame: (gameName: string, playerName: string) =>
      socket.emit("createGame", { gameName, playerName }),
    joinGame: (gameName: string, playerName: string) =>
      socket.emit("joinGame", { gameName, playerName }),
    game
  }
}
