import React from "react"
import styled from "styled-components/native"

export enum StartGameTypes {
  join = "join",
  create = "create"
}

const JoinButton = styled.Button`
  display: flex;
  background-color: pink;
`
const GoBackButton = styled.Button`
  display: flex;
  background-color: red;
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
  const [playerName, setPlayerName] = React.useState("gab")
  const [gameName, setGameName] = React.useState("gamename")
  return (
    <>
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
