import React from "react"
import { SafeAreaView, Text } from "react-native"
import styled from "styled-components/native"

interface ChatMessageProps {
  username: string
  msg: string
}

type Props = ChatMessageProps
export const ChatMessage: React.FC<Props> = props => {
  return (
    <>
      <Text style={{ position: "absolute" }}>{props.msg}</Text>
    </>
  )
}
