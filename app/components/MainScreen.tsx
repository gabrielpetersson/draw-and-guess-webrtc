import React from "react"
import { Dimensions, Text } from "react-native"

import styled from "styled-components/native"
import { MenuScreen } from "./MenuScreen"
import { Spacer } from "./Spacer"
import { GameScreen as GameScreen } from "./GameScreen.tsx"
import { useWebRTC } from "../requests/setupWebRTC"

const GameRoot = styled.View`
  width: ${Dimensions.get("window").width}px;
  height: ${Dimensions.get("window").height}px;
  background: gray;
  flex-direction: row;
`

// const PlayerListContainer = styled.View`
//   width: 100%;
//   height: 70px;
//   padding: 36px;
//   flex-direction: row;
// `
// const PlayerItemContainer = styled.View`
//   flex: 1;
//   height: 25px;
//   align-items: center;
//   justify-content: center;
//   background: lightblue;
// `
// const PlayerMessagesContainer = styled.View`
//   position: absolute;
//   top: -10px;
//   transform: translateY(-100%);
// `
// const PlayerMessage = styled.Text`
//   height: 20px;
// `

// const testMessages = ["hey", "no", "ye"]
// const PlayerName = styled.Text``
// const PlayerListItem = ({ name }: { name: string }) => {
//   return (
//     <PlayerItemContainer>
//       <PlayerMessagesContainer>
//         {testMessages.map(msg => (
//           <PlayerMessage>{msg}</PlayerMessage>
//         ))}
//       </PlayerMessagesContainer>
//       <PlayerName>{name}</PlayerName>
//     </PlayerItemContainer>
//   )
// }

// const PlayerList = () => {
//   return (
//     <PlayerListContainer>
//       <PlayerListItem name={"Matrik"} />
//       <Spacer width={10} />
//       <PlayerListItem name={"Katris"} />
//       <Spacer width={10} />
//       <PlayerListItem name={"Coolio"} />
//       <Spacer width={10} />
//       <PlayerListItem name={"Kabel"} />
//     </PlayerListContainer>
//   )
// }

// const useWebRTC = () => {
//   const peer = React.useRef(setupWebRTC()).current
//   const sendPing = () => peer.send("ping")
//   peer.on("ping", data => console.log("GOT: ", data))
//   return { sendPing }
// }
export const MainScreen = () => {
  // const { sendPing } =
  const [error, setError] = React.useState("")
  const { game, createGame, joinGame } = useWebRTC({ setError })

  // sendPing()
  const [msg, setMsg] = React.useState("")
  console.log("game", game)
  return (
    <GameRoot>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {/* <ChatUserComponent msg={msg} username={["Fatih", "Gabriel", "PETAR"]} /> */}
      {game ? (
        <GameScreen game={game} />
      ) : (
        <MenuScreen createGame={createGame} joinGame={joinGame} />
      )}

      {/* <ChatUserComponent
        changecurrentscreen={changecurrentscreen}
        msg={msg}
        username={["Fatih", "Gabriel", "PETAR"]}
      /> */}

      {/* <GameCanvas />
      <PlayerList /> */}
    </GameRoot>
  )
}

// "react-native-webrtc": "^1.87.2",
//     "simple-peer": "^9.9.3",
//     "socket.io-client": "^3.0.4",
//     "styled-components": "^5.2.1"
// "react-native-canvas": "^0.1.37",
//     "react-native-web": "^0.14.10"
