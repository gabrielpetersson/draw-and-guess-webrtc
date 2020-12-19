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
interface MenuScreenProps {
  currentscreen: void
}

type Props = MenuScreenProps

export const MenuScreen: React.FC<Props> = props => {
  const [currentScreen, setCurrentScreen] = React.useState<number>(0)

  return (
    <FirstScreenRoot>
      <ButtonContainer>
        {currentScreen == 1 && (
          <>
            <JoinScreen currentscreen={props.currentscreen}></JoinScreen>
          </>
        )}
        {currentScreen == 2 && (
          <>
            <CreateScreen currentscreen={props.currentscreen}></CreateScreen>
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
