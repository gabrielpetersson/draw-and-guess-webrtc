import React from "react"
import { Text } from "react-native"
import styled from "styled-components/native"
import { BORDER_COLOR, VERY_COOL_PURPLE } from "../lib/constants"
import { Spacer } from "./Spacer"

export enum StartGameTypes {
  join = "join",
  create = "create"
}
const ButtonContainer = styled.View`
  display: flex;
  justify-content: center;
  width: 40%;
`
const GameInfoInput = styled.TextInput`
  background-color: white;
  border-radius: 4px;
  width: 100%;
  border-width: 1px;
  border-color: ${BORDER_COLOR};
  padding: 5px 10px;
  color: ${BORDER_COLOR};
  font-weight: bold;
`
const NavigationButton = styled.TouchableOpacity`
  font-weight: bold;
  align-items: center;
  background-color: #ffffff;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${BORDER_COLOR};
  height: 100%;
  justify-content: center;
  align-items: center;
`
const LowerButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  height: 36px;
  width: 100%;
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
  const [playerName, setPlayerName] = React.useState("")
  const [gameName, setGameName] = React.useState("")
  return (
    <ButtonContainer>
      <GameInfoInput
        onChangeText={(text: string) => text.length < 10 && setPlayerName(text)}
        placeholder="Your name"
        value={playerName}
        placeholderTextColor={"#999"}
      ></GameInfoInput>
      <Spacer height={30} />
      <GameInfoInput
        placeholder="Game name"
        placeholderTextColor={"#999"}
        onChangeText={(text: string) => text.length < 10 && setGameName(text)}
        value={gameName}
      ></GameInfoInput>
      <Spacer height={30} />
      <LowerButtonContainer>
        <NavigationButton
          style={{ width: "60%", backgroundColor: "#f8f8f8" }}
          onPress={() => {
            if (!playerName.length || !gameName.length) return // TODO set error
            if (startGameType === StartGameTypes.join)
              joinGame(gameName, playerName)
            else if (startGameType === StartGameTypes.create)
              createGame(gameName, playerName)
          }}
        >
          <Text style={{ color: BORDER_COLOR }}>
            {startGameType === StartGameTypes.join
              ? "Join game"
              : "Create game"}
          </Text>
        </NavigationButton>
        <NavigationButton
          style={{
            width: "30%",
            backgroundColor: "#f8f8f8"
          }}
          onPress={goBack}
        >
          <Text style={{ color: BORDER_COLOR }}> Back </Text>
        </NavigationButton>
      </LowerButtonContainer>
    </ButtonContainer>
  )
}
