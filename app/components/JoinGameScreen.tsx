import React from "react"
import styled from "styled-components/native"
import { ButtonContainer } from "./MenuScreen"

export enum StartGameTypes {
  join = "join",
  create = "create"
}

const JoinButton = styled.Button`
  display: flex;

  color: pink;
`
const GoBackButton = styled.Button`
  display: flex;
`

const InputFıelds = styled.TextInput`
  border: 1px;
  background-color: white;

  border-radius: 0.5px;
  padding: 5px;
  color: green;
  font-weight: bold;
`
const TypeOfGamesContainer = styled.View`
  display: flex;
  background-color: black;
  height: 50%;
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
  const [playerName, setPlayerName] = React.useState("gab")
  const [gameName, setGameName] = React.useState("roomName")
  return (
    <ButtonContainer bigger>
      <InputFıelds
        onChangeText={text => text.length < 10 && setPlayerName(text)}
        placeholder="Your name"
        defaultValue={playerName}
      ></InputFıelds>
      <InputFıelds
        placeholder="Game name"
        onChangeText={text =>
          text.length < 10 && setGameName(text.toLowerCase().replace(" ", ""))
        }
        value={gameName}
      ></InputFıelds>
      <JoinButton
        color="green"
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
        color="red"
        title={"Go back"}
        onPress={() => {
          goBack()
        }}
      ></GoBackButton>
    </ButtonContainer>
  )
}
