import React from "react"
import {
  Animated,
  Text,
  TextInput,
  TouchableWithoutFeedback
} from "react-native"
import styled from "styled-components/native"
import { Game, Player } from "../../shared"
import {
  DARK_GREEN,
  LIGHT_BLUE,
  LIGHT_GREEN,
  UGLY_BLUE,
  VERY_COOL_PURPLE
} from "../lib/constants"
import { LineHandler, Point } from "../lib/useLines"
import { IWebRTCLineHandler } from "../requests/setupWebRTC"
import { GameContent } from "./GameContent"
import { Spacer } from "./Spacer"

const GameRoot = styled.View`
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  background-color: ${LIGHT_BLUE};
`
const Players = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50px;
  justify-content: space-evenly;
  align-items: center;
  padding: 5px 0 10px 0;
`
const PlayerContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  height: 100%;
  width: 20%;
`
const PlayerName = styled.Text`
  color: black;
`
const Guess = styled.Text`
  position: absolute;
  left: 0;
  background-color: white;
  border-radius: 4px;
  padding: 4px;
  font-size: 12px;
  width: 100%;
  color: black;
`
const GuessingContainer = styled.View`
  width: 100%;
  padding: 0 30px;
  height: 76px;
  flex-direction: row;
  justify-content: flex-end;
  border-top-color: gray;
  border-top-width: 1px;
  background-color: white;
`
const LeaveButton = styled.View`
  background-color: red;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  height: 34px;
  align-self: center;
  width: 76px;
`
const LeaveText = styled.Text`
  color: white;
  font-size: 16px;
  text-transform: uppercase;
`
const GameHeader = styled.View`
  position: absolute;
  justify-content: center;
  align-items: center;
  border-bottom-color: gray;
  border-bottom-width: 3px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  background-color: white;
  color: white;
  top: 20px;

  border-bottom-color: rgba(0, 0, 0, 0.4);
  border-bottom-width: 1px;

  top: 0;
  width: 100%;
  padding: 20px;
  z-index: 1000;
`
const GameName = styled.Text`
  color: #15c573;
  font-size: 16px;
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
const HeaderRow = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

const getPlayerColor = (player: Player, game: Game) => {
  if (!player.isReady) return "red"
  if (game.currentTurn?.correctGuessPlayerIds.includes(player.id))
    return DARK_GREEN
  if (player.id === game.currentTurn?.painterPlayerId) return VERY_COOL_PURPLE
  return "white"
}
const getPlayerBorderColor = (player: Player, game: Game) => {
  if (!player.isReady) return "white"
  if (game.currentTurn?.correctGuessPlayerIds.includes(player.id))
    return "white"
  if (player.id === game.currentTurn?.painterPlayerId) return "white"
  return DARK_GREEN
}

interface ChatUserComponentProps {
  game: Game
  makeGuess: (guess: string) => void
  leaveGame: () => void
  markAsReady: () => void
  localPlayerId: string
  markPainterAsReady: () => void
  lineHandler: LineHandler
  webRTCLineHandler: IWebRTCLineHandler
}
export const GameScreen = ({
  game,
  makeGuess,
  leaveGame,
  markAsReady,
  localPlayerId,
  markPainterAsReady,
  lineHandler,
  webRTCLineHandler
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
  const isPainter = localPlayerId === game.currentTurn?.painterPlayerId
  return (
    <GameRoot>
      <GameHeader>
        <HeaderRow>
          <Text>Room name:</Text>
          <Spacer width={5} />
          <GameName>{game.name}</GameName>
        </HeaderRow>
        <Spacer height={10} />
        <HeaderRow>
          <GameName style={{ fontSize: 12 }}>
            {game.currentTurn
              ? isPainter
                ? "Your turn!"
                : Object.values(game.participants).find(
                    p => p.id === game.currentTurn?.painterPlayerId
                  )?.name || "some error"
              : ""}
          </GameName>
          <Spacer width={4} />
          <Text style={{ fontSize: 12 }}>
            {game.currentTurn
              ? isPainter
                ? "Paint a"
                : "is painting!"
              : "Waiting for players to press ready..."}
          </Text>
          <Spacer width={4} />
          <GameName style={{ fontSize: 12 }}>
            {game.currentTurn && isPainter ? game.currentTurn.painterWord : ""}
          </GameName>
          <Spacer width={4} />
        </HeaderRow>
      </GameHeader>
      <GameContent
        markAsReady={markAsReady}
        markPainterAsReady={markPainterAsReady}
        localPlayerId={localPlayerId}
        game={game}
        lineHandler={lineHandler}
        webRTCLineHandler={webRTCLineHandler}
      />
      <GameFooter>
        <Players>
          {Object.entries(game.participants).map(([userId, player], index) => {
            return (
              <PlayerContainer
                key={userId}
                style={{
                  backgroundColor: getPlayerColor(player, game),
                  borderColor: getPlayerBorderColor(player, game),
                  borderWidth: 1
                }}
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
                        top: i * -34 - 30,
                        width: "100%",
                        opacity: animation
                      }}
                      key={guess.id}
                    >
                      <Guess>{guess.text}</Guess>
                    </Animated.View>
                  )
                })}
                <PlayerName
                  style={{ color: getPlayerBorderColor(player, game) }}
                >{`${player.name}: ${player.points}`}</PlayerName>
              </PlayerContainer>
            )
          })}
        </Players>
        <GuessingContainer>
          {isPainter ? null : (
            <TextInput
              placeholderTextColor="black"
              placeholder="Guess.."
              defaultValue={guess}
              onChangeText={(text: string) => setGuess(text)}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (!guess) return
                makeGuess(guess)
                setGuess("")
              }}
              style={{
                flex: 1
              }}
            />
          )}
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
