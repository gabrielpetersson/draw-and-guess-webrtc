const words = [
  "tree",
  "bear",
  "potato"
  //   "table",
  //   "flower",
  //   "apple",
  //   "lamp",
  //   "house",
  //   "phone",
  //   "candle",
  //   "duck",
  //   "car",
  //   "bee",
  //   "dog"
]

export class WordGenerator {
  usedWords: string[]
  constructor() {
    this.usedWords = []
  }
  newWord = () => {
    let newWord = ""
    while (newWord && !this.usedWords.includes(newWord)) {
      newWord = words[Math.floor(Math.random() * words.length)]
      if (this.usedWords.length === words.length) this.usedWords = []
    }
    return newWord
  }
}
