import React from "react"
import { Text } from "react-native"

import styled from "styled-components/native"
import { MenuScreen } from "./MenuScreen"
import { GameScreen as GameScreen } from "./GameScreen.tsx"
import { useWebRTC } from "../requests/setupWebRTC"

const GameRoot = styled.View`
  position: relative;
  width: 100%;
  height: 100%;
  background: gray;
`
const ErrorText = styled.Text`
  position: absolute;
  color: red;
  top: 10px;
  left: 10px;
  z-index: 1000000;
`

export const MainScreen = () => {
  const {
    game,
    createGame,
    joinGame,
    makeGuess,
    leaveGame,
    error
  } = useWebRTC()

  return (
    <GameRoot>
      {error ? <ErrorText style={{ color: "red" }}>{error}</ErrorText> : null}
      {game ? (
        <GameScreen leaveGame={leaveGame} game={game} makeGuess={makeGuess} />
      ) : (
        <MenuScreen createGame={createGame} joinGame={joinGame} />
      )}
    </GameRoot>
  )
}
