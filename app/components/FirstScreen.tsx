import React from "react"
import styled from "styled-components/native"
import { JoinScreen } from "./JoinScreen"
import { CreateScreen } from "./CreateScreen"
const FirstScreenRoot = styled.View`
  display: flex;
  flex: 1;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
`
const ButtonContainer = styled.View`
  display: flex;
  justify-content: space-between;
  width: 10%;
  height: 10%;
`
const JoinButton = styled.Button`
  display: flex;
  width: 50%;
  height: 50%;
  background-color: pink;
`
const CreateButton = styled.Button`
  display: flex;
  width: 50%;
  height: 50%;
  color: #f194ff;
  background-color: #f194ff;
`

export const FirstScreen = ({
  createGame,
  joinGame
}: {
  createGame: (gameName: string) => void
  joinGame: (gameName: string) => void
}) => {
  const [currentScreen, setCurrentScreen] = React.useState<number>(0)

  return (
    <FirstScreenRoot>
      <ButtonContainer>
        {currentScreen == 1 && (
          <>
            <JoinScreen></JoinScreen>
          </>
        )}
        {currentScreen == 2 && (
          <>
            <CreateScreen></CreateScreen>
          </>
        )}
        {currentScreen == 0 && (
          <>
            <JoinButton
              onPress={() => setCurrentScreen(1)}
              title="Join"
            ></JoinButton>
            <CreateButton
              onPress={() => setCurrentScreen(2)}
              title="Create"
            ></CreateButton>
          </>
        )}
      </ButtonContainer>
    </FirstScreenRoot>
  )
}
