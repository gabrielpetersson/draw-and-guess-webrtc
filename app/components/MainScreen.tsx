import React from "react"
import styled from "styled-components/native"
import { MenuScreen } from "./MenuScreen"
import { GameScreen } from "./GameScreen.tsx"
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
  // todo split this thing
  const {
    game,
    createGame,
    joinGame,
    makeGuess,
    leaveGame,
    error,
    localPlayerId,
    markAsReady,
    markPainterAsReady,
    lineHandler,
    webRTCLineHandler
  } = useWebRTC()

  return (
    <GameRoot>
      {error ? <ErrorText style={{ color: "red" }}>{error}</ErrorText> : null}
      {game ? (
        <GameScreen
          markAsReady={markAsReady}
          markPainterAsReady={markPainterAsReady}
          localPlayerId={localPlayerId}
          leaveGame={leaveGame}
          game={game}
          makeGuess={makeGuess}
          lineHandler={lineHandler}
          webRTCLineHandler={webRTCLineHandler}
        />
      ) : (
        <MenuScreen createGame={createGame} joinGame={joinGame} />
      )}
    </GameRoot>
  )
}
