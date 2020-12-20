import React from "react"
import styled from "styled-components/native"
import { JoinScreen } from "./JoinScreen"
import { JoinGameScreen } from "./CreateScreen"
const MenuRoot = styled.View`
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

export enum StartGameTypes {
  join = "join",
  create = "create"
}
export const MenuScreen = ({
  createGame,
  joinGame
}: {
  createGame: (gameName: string) => void
  joinGame: (gameName: string) => void
}) => {
  const [
    startGameType,
    setStartGameType
  ] = React.useState<StartGameTypes | null>(null)

  return (
    <MenuRoot>
      <ButtonContainer>
        {startGameType ? (
          <JoinGameScreen
            createGame={createGame}
            joinGame={joinGame}
            startGameType={startGameType}
            goBack={() => setStartGameType(null)}
          ></JoinGameScreen>
        ) : (
          <>
            <JoinButton
              onPress={() => setStartGameType(StartGameTypes.join)}
              title="Join"
            ></JoinButton>
            <CreateButton
              onPress={() => setStartGameType(StartGameTypes.create)}
              title="Create"
            ></CreateButton>
          </>
        )}
      </ButtonContainer>
    </MenuRoot>
  )
}
