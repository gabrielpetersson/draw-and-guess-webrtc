import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput
} from "react-native"
import styled from "styled-components/native"
import { Game } from "../../shared"

const GameRoot = styled.View`
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  background-color: white;
`
const Players = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 40px;
  justify-content: space-evenly;
  align-items: center;
  background-color: blue;
`
const PlayerContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: pink;
  height: 60%;
  width: 20%;
`
const PlayerName = styled.Text``
const Message = styled.Text<{ nthMessage: number }>`
  position: absolute;
  left: 0;
  top: ${p => p.nthMessage * -20 - 5};
  height: 16px;
  font-size: 12px;
  width: 100%;
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
    <KeyboardAvoidingView behavior="height">
      <GameRoot>
        <TextInput
          placeholderTextColor="white"
          placeholder="Guess.."
          value={guess}
          onChangeText={(text: string) => setGuess(text)}
          onSubmitEditing={() => handleSendMessage(guess)}
        />

        {/* <ChatMessage username={"fatih"} msg={currentmsg}></ChatMessage> */}
        {/* <Text style={{ color: "black" }}>{props.roomname}</Text> */}
        <Players>
          {Object.entries(game.participants).map(([userId, player]) => {
            return (
              <PlayerContainer key={userId}>
                {player.guesses.map(msg => (
                  <Message>{msg}</Message>
                ))}
                <PlayerName>{player.name}</PlayerName>
              </PlayerContainer>
            )
          })}
        </Players>
      </GameRoot>
    </KeyboardAvoidingView>
  )
}
