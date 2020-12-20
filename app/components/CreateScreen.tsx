import React from "react"
import styled from "styled-components/native"
import { StartGameTypes } from "./MenuScreen"

const FirstScreenRoot = styled.View`
  display: flex;
  flex: 1;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
`
const ButtonContainer = styled.View`
  display: flex;
  justify-content: space-between;
`
const JoinButton = styled.Button`
  display: flex;
  background-color: pink;
`
const GoBackButton = styled.Button`
  display: flex;
  background-color: red;
`
const CreateButton = styled.Button`
  display: flex;
  color: #f194ff;
  background-color: #f194ff;
`
const InputFıelds = styled.TextInput`
  border: 1px;
  border-radius: 0.2px;
  padding: 5px;
`

interface CreateScreenProps {
  createGame: (gameName: string, playerName: string) => void
  joinGame: (gameName: string, playerName: string) => void
  startGameType: StartGameTypes
  goBack: () => void
}

export const JoinGameScreen = ({
  createGame,
  joinGame,
  startGameType,
  goBack
}: CreateScreenProps) => {
  const [playerName, setUserName] = React.useState("")
  const [gameName, setRoomName] = React.useState("")
  return (
    <>
      <InputFıelds
        onChangeText={text => text.length < 10 && setUserName(text)}
        placeholder="Your name"
        value={playerName}
      ></InputFıelds>
      <InputFıelds
        placeholder="Game name"
        onChangeText={text =>
          text.length < 10 && setRoomName(text.toLowerCase().replace(" ", ""))
        }
        value={gameName}
      ></InputFıelds>
      <JoinButton
        title={
          startGameType === StartGameTypes.join ? "Join room" : "Create room"
        }
        disabled={!playerName || !gameName}
        onPress={() => {
          if (startGameType === StartGameTypes.join)
            joinGame(gameName, playerName)
          else if (startGameType === StartGameTypes.create)
            createGame(gameName, playerName)
        }}
      ></JoinButton>
      <GoBackButton
        title={"Go back"}
        onPress={() => {
          goBack()
        }}
      ></GoBackButton>
    </>
  )
}
