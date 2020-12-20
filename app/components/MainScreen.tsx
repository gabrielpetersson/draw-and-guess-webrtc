import React from "react"
import { Text } from "react-native"

import styled from "styled-components/native"
import { MenuScreen } from "./MenuScreen"
import { GameScreen as GameScreen } from "./GameScreen.tsx"
import { useWebRTC } from "../requests/setupWebRTC"

const GameRoot = styled.View`
  width: 100%;
  height: 100%;
  background: gray;
`

export const MainScreen = () => {
  const [error, setError] = React.useState("")
  const { game, createGame, joinGame } = useWebRTC({ setError })
  console.log("game", game)
  return (
    <GameRoot>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {game ? (
        <GameScreen game={game} />
      ) : (
        <MenuScreen createGame={createGame} joinGame={joinGame} />
      )}
    </GameRoot>
  )
}
