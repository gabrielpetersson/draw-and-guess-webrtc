import React from "react"
import { Text } from "react-native"
import styled from "styled-components/native"
import { VERY_COOL_PURPLE } from "../lib/constants"
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
const GameInput = styled.TextInput`
  background-color: white;
  border-radius: 4px;
  width: 100%;
  padding: 5px 10px;
  color: black;
  font-weight: bold;
`
const NavigationButton = styled.TouchableOpacity`
  font-weight: bold;
  align-items: center;
  background-color: #ffffff;
  border-radius: 4px;
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
  const [playerName, setPlayerName] = React.useState("gab")
  const [gameName, setGameName] = React.useState("roomName")
  return (
    <ButtonContainer>
      <GameInput
        onChangeText={(text: string) => text.length < 10 && setPlayerName(text)}
        placeholder="Your name"
        value={playerName}
        placeholderTextColor={"#999"}
      ></GameInput>
      <Spacer height={30} />
      <GameInput
        placeholder="Game name"
        placeholderTextColor={"#999"}
        onChangeText={(text: string) => text.length < 10 && setGameName(text)}
        value={gameName}
      ></GameInput>
      <Spacer height={30} />
      <LowerButtonContainer>
        <NavigationButton
          style={{ width: "60%", backgroundColor: VERY_COOL_PURPLE }}
          onPress={() => {
            if (startGameType === StartGameTypes.join)
              joinGame(gameName, playerName)
            else if (startGameType === StartGameTypes.create)
              createGame(gameName, playerName)
          }}
        >
          <Text style={{ color: "white" }}>
            {startGameType === StartGameTypes.join
              ? "Join room"
              : "Create room"}
          </Text>
        </NavigationButton>
        <NavigationButton
          style={{
            width: "30%",
            backgroundColor: VERY_COOL_PURPLE
          }}
          onPress={goBack}
        >
          <Text style={{ color: "white" }}> Back </Text>
        </NavigationButton>
      </LowerButtonContainer>
    </ButtonContainer>
  )
}
