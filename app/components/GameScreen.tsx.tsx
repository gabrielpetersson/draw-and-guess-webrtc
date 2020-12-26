import React from "react"
import {
  Animated,
  Text,
  TextInput,
  TouchableWithoutFeedback
} from "react-native"
import styled from "styled-components/native"
import { Game } from "../../shared"
import { LineHandler, Point } from "../lib/useLines"
import { GameContent } from "./GameContent"
import { Spacer } from "./Spacer"

const GameRoot = styled.View`
  flex-direction: row;
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
`
const PlayerContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  height: 60%;
  width: 20%;
`
const PlayerName = styled.Text`
  color: white;
`
const Message = styled.Text`
  position: absolute;
  left: 0;
  background-color: rgba(0, 240, 0, 0.11);
  border-radius: 4px;
  padding: 4px;
  font-size: 12px;
  width: 100%;
  color: black;
`
const GuessingContainer = styled.View`
  width: 100%;
  height: 64px;
  padding: 15px 20px;
  flex-direction: row;
  border-top-color: black;
  border-top-width: 1px;
`
const LeaveButton = styled.View`
  background-color: red;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 30px;
  height: 100%;
  flex: 1;
`
const LeaveText = styled.Text`
  color: white;
  font-size: 16px;
  text-transform: uppercase;
`
const GameHeader = styled.View`
  position: absolute;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-bottom-color: gray;
  border-bottom-width: 1px;
  background-color: #f4f4f4;
  top: 20px;
  left: 0;
  width: 100%;
  height: 56px;
`
const GameName = styled.Text`
  color: #15c573;
  font-size: 18px;
  font-weight: 700;
`

const GameFooter = styled.View`
  position: absolute;
  justify-content: flex-end;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10000000000000;
`

interface ChatUserComponentProps {
  game: Game
  makeGuess: (guess: string) => void
  leaveGame: () => void
  markAsReady: () => void
  localPlayerId: string
  markPainterAsReady: () => void
  lineHandler: LineHandler
  sendPoint: (p: Point) => void
}
export const GameScreen = ({
  game,
  makeGuess,
  leaveGame,
  markAsReady,
  localPlayerId,
  markPainterAsReady,
  lineHandler,
  sendPoint
}: ChatUserComponentProps) => {
  const [guess, setGuess] = React.useState("")
  const [messageFades, setMessageFades] = React.useState<
    Record<string, Animated.Value>
  >({})

  const fadeOut = (anim: Animated.Value) => {
    Animated.timing(anim, {
      delay: 4000,
      toValue: 0,
      duration: 3000,
      useNativeDriver: false
    }).start()
  }
  return (
    <GameRoot>
      <GameHeader>
        <Text>Room name:</Text>
        <Spacer width={10} />
        <GameName>{game.name}</GameName>
      </GameHeader>
      <GameContent
        markAsReady={markAsReady}
        markPainterAsReady={markPainterAsReady}
        localPlayerId={localPlayerId}
        game={game}
        lineHandler={lineHandler}
        sendPoint={sendPoint}
      />
      <GameFooter>
        <Players>
          {Object.entries(game.participants).map(([userId, player]) => {
            return (
              <PlayerContainer
                key={userId}
                style={{ backgroundColor: player.isReady ? "#15c573" : "red" }}
              >
                {[...player.guesses].reverse().map((guess, i) => {
                  const isAnimationExisting = !!messageFades[guess.id]
                  let animation = isAnimationExisting
                    ? messageFades[guess.id]
                    : new Animated.Value(1)
                  if (!isAnimationExisting) {
                    fadeOut(animation)
                    setMessageFades(p => ({
                      [guess.id]: animation,
                      ...p
                    }))
                  }
                  return (
                    <Animated.View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: i * -24 - 30,
                        width: "100%",
                        opacity: animation
                      }}
                      key={guess.id}
                    >
                      <Message>{guess.text}</Message>
                    </Animated.View>
                  )
                })}
                <PlayerName>{`${player.name}: ${player.points}`}</PlayerName>
              </PlayerContainer>
            )
          })}
        </Players>
        <GuessingContainer>
          <TextInput
            placeholderTextColor="black"
            placeholder="Guess.."
            value={guess}
            onChangeText={(text: string) =>
              text.length < 14 && setGuess(text.toLowerCase().replace(" ", ""))
            }
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (!guess) return
              makeGuess(guess)
              setGuess("")
            }}
            style={{
              flex: 4
            }}
          />
          <TouchableWithoutFeedback onPress={leaveGame}>
            <LeaveButton>
              <LeaveText>Leave</LeaveText>
            </LeaveButton>
          </TouchableWithoutFeedback>
        </GuessingContainer>
      </GameFooter>
    </GameRoot>
  )
}
