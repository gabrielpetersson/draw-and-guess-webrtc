import React from "react"
import { Text, TouchableWithoutFeedback } from "react-native"
import styled from "styled-components/native"
import { Game } from "../../shared"
import { getCanvasSize } from "../lib/canvasSize"
import {
  BORDER_COLOR,
  DARK_GREEN,
  LIGHT_GREEN,
  VERY_COOL_PURPLE
} from "../lib/constants"
import { LineHandler } from "../lib/useLines"
import { IWebRTCLineHandler } from "../requests/setupWebRTC"
import { GameCanvas } from "./GameCanvas"
import { GameStatus } from "./GameScreen.tsx"

const GameContentWrapper = styled.View`
  align-items: center;
  align-self: center;
  justify-content: center;
  width: 100%;
  height: ${getCanvasSize()}px;
`
const ReadyButton = styled.View`
  background-color: ${DARK_GREEN};
  border-width: 1px;
  border-color: ${BORDER_COLOR};
  font-weight: 900;
  padding: 10px 25px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`
const PaintText = styled.Text`
  color: white;
`
const PaintReadyButton = styled.View`
  background-color: ${DARK_GREEN};
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 10px 25px;
`
const GameUpdateContainer = styled.View`
  width: 300px;
  height: 200px;
  border-width: 1px;
  padding: 20px;
  border-color: ${BORDER_COLOR};
  background-color: white;
  border-radius: 4px;
  justify-content: space-around;
  align-items: center;
`
const MessageUpdateText = styled.Text`
  color: black;
  text-align: center;
`
const isLocalPlayerReady = (game: Game, localPlayerId: string) =>
  Object.values(game.participants).some(
    player => player.id === localPlayerId && player.isReady
  )
const isLocalPlayerPainter = (game: Game, localPlayerId: string) =>
  game.currentTurn?.painterPlayerId === localPlayerId

interface GameContentProps {
  markAsReady: () => void
  markPainterAsReady: () => void
  localPlayerId: string
  game: Game
  lineHandler: LineHandler
  webRTCLineHandler: IWebRTCLineHandler
}
export const GameContent = ({
  markAsReady,
  markPainterAsReady,
  localPlayerId,
  game,
  lineHandler,
  webRTCLineHandler
}: GameContentProps) => {
  let content: React.ReactNode
  const isReady = isLocalPlayerReady(game, localPlayerId)
  const isPaineterReady = !!game.currentTurn?.isPainterReady
  const hasGameStarted = game.currentTurn?.status === "ACTIVE"
  const isPainter = isLocalPlayerPainter(game, localPlayerId) && hasGameStarted // quickfix for not allowing painting if game not started

  if (!isReady) {
    content = (
      <TouchableWithoutFeedback onPress={markAsReady}>
        <ReadyButton style={{ borderColor: BORDER_COLOR, borderWidth: 1 }}>
          <Text style={{ color: "white" }}>Ready?</Text>
        </ReadyButton>
      </TouchableWithoutFeedback>
    )
  } else if (
    game.currentTurn?.status === GameStatus.ENDED &&
    game.currentTurn
  ) {
    const nCorrectGuesses = game.currentTurn.correctGuessPlayerIds.length
    const allGotItRight =
      nCorrectGuesses >= Object.values(game.participants).length - 1
    const guessedCorrect = game.currentTurn.correctGuessPlayerIds.includes(
      localPlayerId
    )
    let roundOverText
    if (isPainter && nCorrectGuesses === 0) {
      roundOverText =
        "Nobody got your drawing right. Maybe drawing is not for you!"
    } else if (isPainter && allGotItRight) {
      roundOverText = "Are you the next Picasso?! Everyone got it right!"
    } else if (isPainter) {
      roundOverText = "Great job! At least a few got your drawing right."
    } else if (guessedCorrect) {
      roundOverText = "Guessing is over. Great job! You got a point."
    } else {
      roundOverText = "Too bad, you ran out of time :( No points this time!"
    }
    content = (
      <GameUpdateContainer>
        <MessageUpdateText>{roundOverText}</MessageUpdateText>
        {nCorrectGuesses > 2 || (nCorrectGuesses > 1 && !guessedCorrect) ? (
          <MessageUpdateText>{`These people got it right: ${game.currentTurn.correctGuessPlayerIds
            .map(id => {
              Object.values(game.participants).find(p => p.id === id)?.name
            })
            .filter(Boolean)
            .join(", ")}`}</MessageUpdateText>
        ) : null}
      </GameUpdateContainer>
    )
  } else if (!isPaineterReady && isPainter) {
    content = (
      <GameUpdateContainer>
        <MessageUpdateText>{`Your turn to draw! Draw a ${game.currentTurn?.painterWord}`}</MessageUpdateText>
        <TouchableWithoutFeedback onPress={markPainterAsReady}>
          <PaintReadyButton>
            <PaintText>Paint the word!</PaintText>
          </PaintReadyButton>
        </TouchableWithoutFeedback>
      </GameUpdateContainer>
    )
  } else if (!isPaineterReady) {
    content = (
      <GameUpdateContainer>
        <MessageUpdateText>
          {game.currentTurn?.painterPlayerId
            ? `Waiting for ${
                Object.values(game.participants).find(
                  p => p.id === game.currentTurn?.painterPlayerId
                )?.name
              } to start painting...`
            : "Waiting until all players are ready"}
        </MessageUpdateText>
      </GameUpdateContainer>
    )
  } else
    content = (
      <GameCanvas
        isPainter={isPainter}
        lineHandler={lineHandler}
        webRTCLineHandler={webRTCLineHandler}
      />
    )
  return <GameContentWrapper>{content}</GameContentWrapper>
}
