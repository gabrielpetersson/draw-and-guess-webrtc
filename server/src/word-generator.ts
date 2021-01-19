const words = [
  "tree",
  "bear",
  "potato",
  "table",
  "flower",
  "apple",
  "lamp",
  "house",
  "phone",
  "candle",
  "duck",
  "car",
  "bee",
  "dog"
]

export class WordGenerator {
  usedWords: string[]
  constructor() {
    this.usedWords = []
  }
  private generate = () => words[Math.floor(Math.random() * words.length)]
  newWord = () => {
    let count = 0
    let newWord = this.generate()
    while (this.usedWords.includes(newWord)) {
      count++
      newWord = this.generate()
      if (this.usedWords.length === words.length) this.usedWords = []
      if (count > 100) {
        console.log("server error: infinite new word loop")
        this.usedWords = []
        newWord = this.generate()
        break
      }
    }
    this.usedWords.push(newWord)
    return newWord
  }
}
