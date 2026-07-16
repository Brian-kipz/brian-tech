// lib/tictactoe.js
// Minimal TicTacToe game logic
class TicTacToe {
  constructor() {
    this.reset()
  }
  reset() {
    this.board = Array(9).fill(null)
    this.turn = 'X'
    this.winner = null
  }
  playMove(pos) {
    if (this.winner) throw new Error('Game over')
    if (pos < 0 || pos > 8) throw new Error('Invalid position')
    if (this.board[pos]) throw new Error('Position taken')
    this.board[pos] = this.turn
    this._checkWin()
    this.turn = this.turn === 'X' ? 'O' : 'X'
  }
  _checkWin() {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ]
    for (const [a,b,c] of wins) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.board[a]
        return
      }
    }
    if (this.board.every(Boolean)) this.winner = 'draw'
  }
  getBoard() { return this.board.slice() }
}

module.exports = TicTacToe
