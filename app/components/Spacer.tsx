import styled from "styled-components/native"

export const Spacer = styled.View<{ width?: number; height?: number }>`
  height: ${p => (p.height ? p.height : 0)}px;
  max-height: ${p => (p.height ? p.height : 0)}px;
  min-height: ${p => (p.height ? p.height : 0)}px;
  width: ${p => (p.width ? p.width : 0)}px;
  max-width: ${p => (p.width ? p.width : 0)}px;
  min-width: ${p => (p.width ? p.width : 0)}px;
`
