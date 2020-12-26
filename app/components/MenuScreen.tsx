import React from "react"
import styled from "styled-components/native"
import { Platform, Text, StyleSheet } from "react-native"
import { JoinGameScreen, StartGameTypes } from "./JoinGameScreen"
import mainbackground from "../static/background.jpg"
import ImageResizeMode from "react-native/Libraries/Image/ImageResizeMode"
import logo from "../static/pencil.png"
import { TouchableOpacity } from "react-native-gesture-handler"

export const MainBackground = styled.ImageBackground`
  display: flex;
  flex: 1;
`

export const LogoContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%;
`
const LogoImage = styled.Image`
  position: absolute;
`

const MenuRoot = styled.View`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`
export const ButtonContainer = styled.View<{ bigger?: boolean }>`
  display: flex;
  justify-content: space-between;
  width:${p => (p.bigger ? "50%" : "50%")}
  height: ${p => (p.bigger ? "30%" : "15%")};
`
const JoinButton = styled.TouchableOpacity`
  font-weight: bold;
  align-items: center;
  background-color: #dddddd;
  padding: 10px;
`
const CreateButton = styled.TouchableOpacity`
  align-items: center;
  background-color: #dddddd;
  padding: 10px;
`

const ButtonText = styled.Text`
  color: red;
  background-color: red;
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
  const styles = StyleSheet.create({
    button: {}
  })
  return (
    <MainBackground
      blurRadius={Platform.OS == "ios" ? 10 : 2}
      source={mainbackground}
    >
      <MenuRoot>
        <LogoImage
          source={logo}
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
            <JoinButton onPress={() => setStartGameType(StartGameTypes.join)}>
              <Text style={{ fontWeight: "bold" }}> Join </Text>
            </JoinButton>
            <CreateButton
              onPress={() => setStartGameType(StartGameTypes.create)}
            >
              <Text style={{ fontWeight: "bold" }}> Create </Text>
            </CreateButton>
          </ButtonContainer>
        )}
      </MenuRoot>
    </MainBackground>
  )
}
