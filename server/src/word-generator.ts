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
  private generate = () => words[Math.floor(Math.random() * words.length)]
  newWord = () => {
    let newWord = this.generate()
    while (this.usedWords.includes(newWord)) {
      newWord = this.generate()
      if (this.usedWords.length === words.length) this.usedWords = []
    }
    this.usedWords.push(newWord)
    return newWord
  }
}
