import SimplePeer from "simple-peer"

const socket = io()

const peer = new SimplePeer({ initiator: true })
peer.on("signal", data => socket.emit("signal", data))
peer.on("connect", () => console.log("connected"))
socket.on("signal", data => peer.signal(data))
