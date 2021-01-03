import { useEffect, useRef, MutableRefObject } from "react"

const useInterval = (callback: () => void, delay: number) => {
  const savedCallback = useRef(() => {}) as MutableRefObject<() => void>
  useEffect(() => {
    savedCallback.current = callback
  }, [callback, savedCallback])
  useEffect(() => {
    function tick() {
      savedCallback?.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, savedCallback])
}

export default useInterval
