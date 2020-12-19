import React from "react"
import { Dimensions } from "react-native"

import styled from "styled-components/native"
import { FirstScreen } from "./FirstScreen"
import { Spacer } from "./Spacer"
import { ChatUserComponent } from "./ChatUserComponent"

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
export const GameScreen = () => {
  // const { sendPing } =
  // useWebRTC()
  // sendPing()
  const [msg, setMsg] = React.useState("")

  return (
    <GameRoot>
      {/* <ChatUserComponent msg={msg} username={["Fatih", "Gabriel", "PETAR"]} /> */}
      <FirstScreen />
      {/* <GameCanvas />
      <PlayerList /> */}
    </GameRoot>
  )
}
