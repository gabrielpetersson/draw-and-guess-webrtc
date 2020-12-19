import React from "react"
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
  RTCSessionDescriptionType
} from "react-native-webrtc"
import Socket from "socket.io-client"

const config = { iceServers: [{ url: "stun:stun.l.google.com:19302" }] }
// const pc = new RTCPeerConnection(configuration)

export const useWebRTC = () => {
  const peerConnections = React.useRef<Map<string, RTCPeerConnection>>(
    new Map()
  )
  const [socket] = React.useState(Socket.connect("ws://localhost:8000"))

  React.useEffect(() => {
    socket.on("connect", () => {
      socket.emit("broadcaster")

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

      socket.on("candidate", (id: string, candidate: RTCIceCandidateType) => {
        const candidateBuffer = new RTCIceCandidate(candidate as any)
        const connectionBuffer = peerConnections.current.get(id)
        if (!connectionBuffer) return
        connectionBuffer.addIceCandidate(candidateBuffer)
      })

      socket.on(
        "answer",
        (id: string, remoteOfferDescription: RTCSessionDescriptionType) => {
          const connectionBuffer = peerConnections.current.get(id)
          if (!connectionBuffer) return
          connectionBuffer.setRemoteDescription(remoteOfferDescription)
        }
      )

      socket.on("disconnectPeer", (id: string) => {
        if (!peerConnections.current) return
        peerConnections.current.get(id)?.close()
        peerConnections.current.delete(id)
      })
    })

    return () => {
      if (socket.connected) socket.close()
    }
  }, [socket])
}
