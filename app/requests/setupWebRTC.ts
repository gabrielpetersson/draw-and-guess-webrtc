import React from "react"
import { Dimensions } from "react-native"
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescriptionType,
  registerGlobals,
  RTCIceCandidateType
} from "react-native-webrtc"
import { io, Socket } from "socket.io-client/build/index"
import { CreateGameOptions, Game, JoinGameOptions } from "../../shared"
import { useLines } from "../lib/useLines"

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
  const [dataChannel, setDataChannel] = React.useState<RTCDataChannel | null>(
    null
  )

  const lineHandler = useLines()

  React.useEffect(() => {
    if (!dataChannel) return
    // @ts-ignore react native webrtc types are mega outdated
    dataChannel.onmessage = (ev: MessageEvent) => {
      const data = JSON.parse(ev.data)
      const newPoint = {
        x: data[0] * Dimensions.get("screen").width,
        y: data[1] * Dimensions.get("screen").height
      }
      lineHandler.addNewPoint(newPoint)
    }
  }, [dataChannel])

  //@ts-ignore
  const sendPoint = (point: Point) => {
    if (!dataChannel) return
    const { width, height } = Dimensions.get("screen")
    const normalizedPoint = [point.x / width, point.y / height]
    dataChannel?.send(JSON.stringify(normalizedPoint))
  }

  React.useEffect(() => {
    const socket = io("ws://192.168.1.232:8000")
    socket.on("connect", () => {
      console.log("connected")
      socket.emit("broadcaster")

      socket.on("webrtcWatcher", async (id: string) => {
        const localConnection = new RTCPeerConnection(config)

        const dataChannel = (localConnection.createDataChannel(
          "text"
        ) as unknown) as RTCDataChannel // types are outdated

        dataChannel.onerror = function (error) {
          console.log("dataChannel.onerror", error)
        }

        dataChannel.onopen = function () {
          setDataChannel(dataChannel)
        }

        dataChannel.onclose = function () {
          console.log("dataChannel.onclose")
        }

        localConnection.onicecandidate = ({ candidate }) => {
          // console.log("local ice cand", candidate)
          if (candidate) socket.emit("candidate", id, candidate)
        }

        localConnection.oniceconnectionstatechange = e =>
          console.log("[ICE STATUS]", e.target.iceConnectionState)

        const localDescription = await localConnection.createOffer({
          iceRestart: true
        })
        await localConnection.setLocalDescription(localDescription)
        socket.emit("webrtcOffer", id, localConnection.localDescription)
        peerConnections.current.set(id, localConnection)
      })

      socket.on(
        "webrtcOffer",
        async (id: string, offer: RTCSessionDescriptionType) => {
          const localConnection = new RTCPeerConnection(config)

          localConnection.onicecandidate = ({ candidate }) => {
            if (candidate) socket.emit("candidate", id, candidate)
          }

          // @ts-ignore
          localConnection.ondatachannel = ({
            channel
          }: {
            channel: RTCDataChannel
          }) => {
            channel.onopen = () => setDataChannel(channel)
          }

          await localConnection.setRemoteDescription(offer)
          const localDescription = await localConnection.createAnswer()
          await localConnection.setLocalDescription(localDescription)
          socket.emit("webrtcAnswer", id, localDescription)
        }
      )

      socket.on("candidate", (id: string, candidate: RTCIceCandidateType) => {
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        setTimeout(
          () =>
            connectionBuffer.addIceCandidate(candidate).catch(e => {
              console.log("Failure during addIceCandidate(): " + e.name)
            }),
          800
        )
      })

      socket.on(
        "answer",
        async (
          id: string,
          remoteOfferDescription: RTCSessionDescriptionType
        ) => {
          const localConnection = peerConnections.current.get(id)
          if (!localConnection) return
          localConnection.setRemoteDescription(remoteOfferDescription)
        }
      )

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
    lineHandler,
    sendPoint,
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
