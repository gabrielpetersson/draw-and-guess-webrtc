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
  BORDER_COLOR,
  DARK_GREEN,
  LIGHT_BLUE,
  LIGHT_RED,
  VERY_COOL_PURPLE
} from "../lib/constants"
import useInterval from "../lib/useInterval"
import { LineHandler } from "../lib/useLines"
import { IWebRTCLineHandler } from "../requests/setupWebRTC"
import { GameContent } from "./GameContent"
import { Spacer } from "./Spacer"

const GameRoot = styled.View`
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  background-color: #e4e4e4;
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
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  text-align: center;
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
  border-top-color: ${BORDER_COLOR};
  border-top-width: 1px;
  background-color: white;
`
const LeaveButton = styled.View`
  position: absolute;
  right: 20px;
  align-self: center;
  background-color: ${VERY_COOL_PURPLE};
  border-color: ${BORDER_COLOR};
  border-width: 1px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  height: 100%;
  align-self: center;
  width: 56px;
`
const LeaveText = styled.Text`
  color: white;
  font-size: 16px;
`
const GameHeader = styled.View`
  position: absolute;
  justify-content: center;
  align-items: center;
  border-bottom-color: ${BORDER_COLOR};
  border-bottom-width: 1px;
  background-color: #f4f4f4;
  top: 0;
  width: 100%;
  padding: 20px;
  z-index: 1000;
`
const GameName = styled.Text`
  color: ${VERY_COOL_PURPLE};
  font-size: 16px;
  font-weight: 700;
`
const GameFooter = styled.View`
  position: absolute;
  justify-content: flex-end;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`
const HeaderRow = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

export enum GameStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED"
}

const getPlayerColor = (player: Player, game: Game) => {
  if (!player.isReady) return "white"
  if (game.currentTurn?.correctGuessPlayerIds.includes(player.id))
    return DARK_GREEN
  if (player.id === game.currentTurn?.painterPlayerId) return VERY_COOL_PURPLE
  return "white"
}
const getPlayerBorderColor = (player: Player, game: Game) => {
  if (player.id === game.currentTurn?.painterPlayerId) return "white"
  if (game.currentTurn?.correctGuessPlayerIds.includes(player.id))
    return "white"
  return BORDER_COLOR
  // if (!player.isReady) return "white"
  // if (game.currentTurn?.correctGuessPlayerIds.includes(player.id))
  //   return "white"
  // if (player.id === game.currentTurn?.painterPlayerId) return "white"
  // return DARK_GREEN
}

const CountDownWrapper = styled.View`
  position: absolute;
  align-self: center;
  left: 20px;
  z-index: 100;
`
const CountDown = ({ game }: { game: Game }) => {
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
  if (!game.currentTurn?.turnEndTS) return null
  useInterval(() => {
    game.currentTurn &&
      setTimeLeft(
        Math.max(
          Math.floor((game.currentTurn.turnEndTS - Date.now()) / 1000),
          0
        )
      )
  }, 1000)

  return (
    <CountDownWrapper>
      <Text style={{ color: VERY_COOL_PURPLE, fontSize: 20 }}>{timeLeft}</Text>
    </CountDownWrapper>
  )
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
      useNativeDriver: true
    }).start()
  }
  const isPainter = localPlayerId === game.currentTurn?.painterPlayerId
  return (
    <GameRoot>
      <GameHeader>
        {game.currentTurn?.status === "ACTIVE" ? (
          <CountDown game={game} />
        ) : null}
        <HeaderRow>
          <Text>Room name:</Text>
          <Spacer width={5} />
          <GameName>{game.name}</GameName>
        </HeaderRow>
        <TouchableWithoutFeedback onPress={leaveGame}>
          <LeaveButton>
            <LeaveText>Leave</LeaveText>
          </LeaveButton>
        </TouchableWithoutFeedback>
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
          {Object.entries(game.participants).map(([userId, player]) => {
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
                        top: i * -30 - 30,
                        width: "100%",
                        height: 24,
                        opacity: animation,
                        backgroundColor: "white",
                        borderRadius: 4,
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: BORDER_COLOR,
                        borderWidth: 1
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
              autoCapitalize={"none"}
              autoCorrect={false}
              autoFocus
              autoCompleteType={"off"}
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
        </GuessingContainer>
      </GameFooter>
    </GameRoot>
  )
}
