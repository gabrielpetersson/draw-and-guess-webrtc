import React from "react"
import {
  RTCPeerConnection,
  RTCSessionDescriptionType,
  registerGlobals,
  RTCIceCandidateType
} from "react-native-webrtc"
import { io, Socket } from "socket.io-client/build/index"
import { CreateGameOptions, Game, JoinGameOptions } from "../../shared"
import { getCanvasSize } from "../lib/canvasSize"
import { Point, useLines } from "../lib/useLines"
import { throttle } from "lodash"

registerGlobals()
const config = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] }
const dataChannelOptions = {
  ordered: false,
  maxRetransmits: 0 // in milliseconds
}

export interface IWebRTCLineHandler {
  sendPoint: (p: Point) => void
  sendNewLine: () => void
}
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
    console.log("Data channel open")
    dataChannel.onmessage = (ev: MessageEvent) => {
      const [intent, ...data] = JSON.parse(ev.data)

      if (intent === 0) {
        const size = getCanvasSize()
        const newPoint = {
          x: data[0] * size,
          y: data[1] * size
        }
        lineHandler.addNewPoint(newPoint)
      } else if (intent === 1) {
        lineHandler.createNewLine()
      }
    }
  }, [dataChannel])

  const truncate = (n: number) => Math.floor(100000 * n + 0.5) / 100000
  const sendPoint = throttle((point: Point) => {
    if (!dataChannel) return
    const size = getCanvasSize()
    const normalizedPoint = [
      0,
      truncate(point.x / size),
      truncate(point.y / size)
    ]
    // todo: send as arraybuffer, for some reason nothing is received though
    dataChannel?.send(JSON.stringify(normalizedPoint))
  }, 10)
  const sendNewLine = () => {
    if (!dataChannel) return
    dataChannel?.send(JSON.stringify([1]))
  }

  const disconnectAllPeers = () => {
    Object.values(peerConnections.current).forEach(peer => {
      peer.close()
    })
    peerConnections.current = new Map()
  }
  const disconnectSelf = () => {
    socket?.emit("webrtcDisconnectSelf")
  }

  React.useEffect(() => {
    // const socket = io("ws://192.168.8.100:8000")
    const socket = io("ws://192.168.8.100:8000")
    // const socket = io("wss://draw-and-guess-webrtc.herokuapp.com/")

    socket.on("connect", () => {
      console.log("connected")

      socket.on("webrtcWatcher", async (id: string) => {
        console.log("watcher", id)
        const prevPeer = peerConnections.current.get(id)
        if (prevPeer?.signalingState === "stable") {
          console.log("watcher on established con")
          return
        }
        const localConnection = new RTCPeerConnection(config)
        const dataChannel = (localConnection.createDataChannel(
          "text",
          dataChannelOptions
        ) as unknown) as RTCDataChannel // types are outdated

        dataChannel.onerror = err => {
          console.log("dataChannel.onerror", err)
        }

        dataChannel.onopen = () => {
          console.log("[webrtc]", "data channel opened")
          socket.emit("clientInfo", `data channel open`)
          setDataChannel(dataChannel)
        }

        dataChannel.onclose = () => {
          console.log("dataChannel.onclose")
        }

        localConnection.onicecandidate = ({ candidate }) => {
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
          console.log("offer from", id)
          const prevPeer = peerConnections.current.get(id)
          if (prevPeer?.signalingState === "stable") {
            console.log("offer on established con")
            // return
          }

          const localConnection = new RTCPeerConnection(config)

          localConnection.onicecandidate = ({ candidate }) => {
            if (candidate) socket.emit("candidate", id, candidate)
          }

          // @ts-ignore / outdated types
          localConnection.ondatachannel = ({
            channel
          }: {
            channel: RTCDataChannel
          }) => {
            channel.onopen = () => setDataChannel(channel)
          }

          // if (localConnection.signalingState === "stable")
          //return
          await localConnection.setRemoteDescription(offer)
          const localDescription = await localConnection.createAnswer()
          await localConnection.setLocalDescription(localDescription)
          socket.emit("webrtcAnswer", id, localDescription)
        }
      )

      socket.on("candidate", (id: string, candidate: RTCIceCandidateType) => {
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        setTimeout(() => connectionBuffer.addIceCandidate(candidate), 400)
      })

      socket.on(
        "webrtcAnswer",
        (id: string, remoteOfferDescription: RTCSessionDescriptionType) => {
          const localConnection = peerConnections.current.get(id)
          if (!localConnection) {
            console.error("Did not find peer")
            socket.emit("info", "Did not find peer")
            return
          }
          if (localConnection.signalingState === "stable") {
            console.error("trying to reestablish already successful connection")
            // return
          }
          console.log("[REMOTE DESC STATE]", localConnection.signalingState)

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
        disconnectSelf()
        disconnectAllPeers()
        setGame(null)
      })

      socket.on("gameError", (error: string) => {
        setError(error)
        setTimeout(() => setError(""), 5000) // quickfix, should be removed on actions instead
      })

      socket.on("error", (error: string) => {
        console.log("[socket error]", error)
        setError(error)
        setTimeout(() => setError(""), 5000) // quickfix, should be removed on actions instead
      })

      socket.on("disconnect", () => {
        console.log("diconnected")
        socket.off()
        setGame(null)
      })

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
    webRTCLineHandler: { sendPoint, sendNewLine },
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
