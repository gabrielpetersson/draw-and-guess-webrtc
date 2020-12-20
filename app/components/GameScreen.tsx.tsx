import React from "react"
import { Dimensions, SafeAreaView, Text, TextInput } from "react-native"
import styled from "styled-components/native"
import { Game } from "../requests/setupWebRTC"
import { ChatMessage } from "./ChatMessage"

const GameRoot = styled.View`
  flex-direction: column;
  width: ${Dimensions.get("window").width}px;
  height: ${Dimensions.get("window").height}px;
  align-self: flex-end;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  justify-content: space-between;
  align-items: center;
  height: 20%;
  background-color: white;
`
const InputBox = styled.View`
  display: flex;
  background-color: black;
  padding: 5px;
  width: 50%;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`
const InputFıeld = styled.TextInput`
  color: white;
`
const ChatBox = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;

  flex-wrap: wrap;
  justify-content: space-evenly;
`
const ChatContainer = styled.View`
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  padding: 5px;
  justify-content: space-evenly;
  background-color: pink;
`
const ChatContainerLeft = styled.View`
  display: flex;
  justify-content: center;
`
const ChatContainerRight = styled.View`
  display: flex;
`
const ChatText = styled.Text``
const GuessButton = styled.Button`
  display: flex;
`

interface ChatUserComponentProps {
  game: Game
}

export const GameScreen = ({ game }: ChatUserComponentProps) => {
  const [guess, setGuess] = React.useState("")

  const handleSendMessage = (msg: string) => {
    console.log("guess", msg)
  }

  return (
    <GameRoot>
      <InputBox>
        <TextInput
          placeholderTextColor="white"
          placeholder="Guess.."
          value={guess}
          onChangeText={(text: string) => setGuess(text)}
          onSubmitEditing={() => handleSendMessage(guess)}
        />
      </InputBox>
      {/* <ChatMessage username={"fatih"} msg={currentmsg}></ChatMessage> */}
      {/* <Text style={{ color: "black" }}>{props.roomname}</Text> */}
      <ChatBox>
        {Object.entries(game.participants).map(([userId, user]) => {
          return (
            <ChatContainer key={userId}>
              <ChatContainerLeft>
                <ChatText>{user.name}</ChatText>
              </ChatContainerLeft>
            </ChatContainer>
          )
        })}
      </ChatBox>
    </GameRoot>
  )
}
