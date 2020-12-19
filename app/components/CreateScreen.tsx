import React from "react"
import styled from "styled-components/native"

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
  background-color: pink;
`
const CreateButton = styled.Button`
  display: flex;
  color: #f194ff;
  background-color: #f194ff;
`
const InputFıelds = styled.TextInput`
  border: 1px 
  border-radius: 0.2px;
  padding: 5px;
`
interface CreateScreenProps {
  currentscreen: void
}

type Props = CreateScreenProps
export const CreateScreen: React.FC<Props> = props => {
  const [userName, setUserName] = React.useState("")
  const [roomName, setRoomName] = React.useState("")
  const [currentScreen, setCurrentScreen] = React.useState<number>(0)

  return (
    <>
      <InputFıelds
        onChangeText={text => setUserName(text)}
        placeholder="username"
        value={userName}
      ></InputFıelds>
      <InputFıelds
        placeholder="roomname"
        onChangeText={text => setRoomName(text)}
        value={roomName}
      ></InputFıelds>
      <JoinButton
        title="Join Room"
        disabled={!userName || !roomName}
        onPress={() => {
          props.currentscreen(1, userName, roomName)
        }}
      ></JoinButton>
    </>
  )
}
