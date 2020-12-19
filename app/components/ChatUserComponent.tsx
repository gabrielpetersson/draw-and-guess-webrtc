import React from "react"
import { SafeAreaView, Text } from "react-native"
import styled from "styled-components/native"
import { ChatMessage } from "./ChatMessage"

const ChatRoot = styled.View`
  flex-direction: column;
  width: 100%;
  align-self: flex-end;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  justify-content: space-between;
  align-items: center;
  height: 20%;
  background-color: white;
`
const InputBox = styled.View`
  display: flex;
  background-color: black;
  padding: 5px;
  width: 50%;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`
const InputFıeld = styled.TextInput`
  color: white;
`
const ChatBox = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;

  flex-wrap: wrap;
  justify-content: space-evenly;
`
const ChatContainer = styled.View`
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  padding: 5px;
  justify-content: space-evenly;
  background-color: pink;
`
const ChatContainerLeft = styled.View`
  display: flex;
  justify-content: center;
`
const ChatContainerRight = styled.View`
  display: flex;
`
const ChatText = styled.Text``
const GuessButton = styled.Button`
  display: flex;
`

interface ChatUserComponentProps {
  username: string[]
  msg: string
  roomname: string
}

type Props = ChatUserComponentProps
export const ChatUserComponent: React.FC<Props> = props => {
  const [activemsg, setActivemsg] = React.useState("")
  const [currentmsg, setCurrentMsg] = React.useState("")
  const handleSendMessage = () => {
    setCurrentMsg(activemsg)
    console.log(currentmsg)
  }
  return (
    <>
      <ChatRoot>
        <InputBox>
          <InputFıeld
            placeholderTextColor="white"
            placeholder="text.."
            onChangeText={text => setActivemsg(text)}
          ></InputFıeld>
          <GuessButton
            disabled={!activemsg}
            onPress={handleSendMessage}
            title="Send"
          ></GuessButton>
        </InputBox>
        {/* <ChatMessage username={"fatih"} msg={currentmsg}></ChatMessage> */}
        {/* <Text style={{ color: "black" }}>{props.roomname}</Text> */}
        <ChatBox>
          {props.username.map(user => {
            return (
              <ChatContainer>
                <ChatContainerLeft>
                  <ChatText>{user}</ChatText>
                </ChatContainerLeft>
              </ChatContainer>
            )
          })}
        </ChatBox>
      </ChatRoot>
    </>
  )
}
