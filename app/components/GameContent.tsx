import React from "react"
import { Dimensions, Text, TouchableWithoutFeedback } from "react-native"
import styled from "styled-components/native"
import { Game } from "../../shared"
import { LineHandler, Point } from "../lib/useLines"
import { GameCanvas as GameCanva } from "./GameCanvass"

const GameContentWrapper = styled.View`
  align-items: center;
  align-self: center;
  justify-content: center;
  width: ${Dimensions.get("screen").width}px;
  height: ${Dimensions.get("screen").width}px;
`

const ReadyButton = styled.View`
  background-color: #15c573;
  color: white;
  font-size: 24px;
  font-weight: 900;
  width: 100px;
  height: 36px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`

const PaintText = styled.Text`
  color: white;
`
const PaintReadyButton = styled.View`
  background-color: #15c573;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 100px;
  height: 36px;
`
const WhatToPaintContainer = styled.View`
  width: 300px;
  height: 180px;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  justify-content: space-evenly;
  align-items: center;
`
const WhatToPaintText = styled.Text`
  color: black;
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
  sendPoint: (p: Point) => void
}
export const GameContent = ({
  markAsReady,
  markPainterAsReady,
  localPlayerId,
  game,
  lineHandler,
  sendPoint
}: GameContentProps) => {
  let content: React.ReactNode
  const isReady = isLocalPlayerReady(game, localPlayerId)
  const isPaineterReady = !!game.currentTurn?.isPainterReady
  const isPainter = isLocalPlayerPainter(game, localPlayerId)
  if (!isReady) {
    content = (
      <TouchableWithoutFeedback onPress={markAsReady}>
        <ReadyButton>
          <Text style={{ color: "white" }}>Ready?</Text>
        </ReadyButton>
      </TouchableWithoutFeedback>
    )
  } else if (!isPaineterReady && isPainter) {
    content = (
      <WhatToPaintContainer>
        <WhatToPaintText>{`You got the honor to paint: ${game.currentTurn?.painterWord}`}</WhatToPaintText>
        <TouchableWithoutFeedback onPress={markPainterAsReady}>
          <PaintReadyButton>
            <PaintText>Paint the word!</PaintText>
          </PaintReadyButton>
        </TouchableWithoutFeedback>
      </WhatToPaintContainer>
    )
  } else content = <GameCanva lineHandler={lineHandler} sendPoint={sendPoint} />
  return <GameContentWrapper>{content}</GameContentWrapper>
}
