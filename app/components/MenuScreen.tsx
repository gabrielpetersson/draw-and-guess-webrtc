import React from "react"
import styled from "styled-components/native"
import { Text } from "react-native"
import { JoinGameScreen, StartGameTypes } from "./JoinGameScreen"
import ImageResizeMode from "react-native/Libraries/Image/ImageResizeMode"
import BigPen from "../static/pencil.png"
import { LinearGradient } from "expo-linear-gradient"
import { LIGHT_BLUE, UGLY_BLUE } from "../lib/constants"
import { Spacer } from "./Spacer"

const LogoImage = styled.Image`
  position: absolute;
`
const MenuRoot = styled(LinearGradient)`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`
const ButtonContainer = styled.View`
  display: flex;
  justify-content: space-between;
`
const MenuButton = styled.TouchableOpacity`
  font-weight: bold;
  align-items: center;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 10px 60px;
`

export const MenuScreen = ({
  createGame,
  joinGame
}: {
  createGame: (gameName: string, playerName: string) => void
  joinGame: (gameName: string, playerName: string) => void
}) => {
  const [
    startGameType,
    setStartGameType
  ] = React.useState<StartGameTypes | null>(null)

  return (
    <MenuRoot colors={[UGLY_BLUE, LIGHT_BLUE]}>
      <LogoImage
        source={BigPen}
        resizeMode={ImageResizeMode.contain}
      ></LogoImage>
      {startGameType ? (
        <JoinGameScreen
          createGame={createGame}
          joinGame={joinGame}
          startGameType={startGameType}
          goBack={() => setStartGameType(null)}
        ></JoinGameScreen>
      ) : (
        <ButtonContainer>
          <MenuButton onPress={() => setStartGameType(StartGameTypes.join)}>
            <Text style={{ color: "#333", fontWeight: "bold" }}> Join </Text>
          </MenuButton>
          <Spacer height={30} />
          <MenuButton onPress={() => setStartGameType(StartGameTypes.create)}>
            <Text style={{ color: "#333", fontWeight: "bold" }}> Create </Text>
          </MenuButton>
        </ButtonContainer>
      )}
    </MenuRoot>
  )
}
