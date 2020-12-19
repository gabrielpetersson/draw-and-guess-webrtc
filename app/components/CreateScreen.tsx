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
const InputFıelds = styled.TextInput`
  border: 1px 
  border-radius: 0.2px;
  padding: 5px;
`
export const CreateScreen = () => {
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
      ></JoinButton>
    </>
  )
}
