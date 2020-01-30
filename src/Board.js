import React, { Component } from "react";
import Cell from "./Cell";
import { chance, superChance } from "./helpers";
import "./Board.css";

class Board extends Component {
  static defaultProps = {
    nrows: 5,
    ncols: 5,
    timeout: "00:60:00",
    timeScoreBase: "15",
    stepScoreBase: "30",
    bestPlayTime: "00:10:00",
    bestStepCount: 30
  };

  constructor(props) {
    super(props);

    this.state = {
      board: chance(this.props.nrows, this.props.ncols),
      steps: 0,
      score: 0,
      time: "00:00:00",
      playing: false,
      timeout: false,
      pause: false,
      hasWon: false
    };
    this.showTime = this.showTime.bind(this);
  }

  componentDidMount() {
    let supper = "";
    document.addEventListener("keydown", event => {
      const charList = "abcdefghijklmnopqrstuvwxyz0123456789";
      const key = event.key.toLowerCase();

      // once upon a spell
      if (charList.indexOf(key) === -1) {
        supper &&
          supper === "zubi" &&
          this.setState({
            board: superChance(this.props.ncols, this.props.nrows)
          });

        supper = "";
        return;
      }

      supper += key;
    });
  }

  createBoard() {
    let board = [];
    // TODO: create array-of-arrays of true/false values
    return board;
  }

  /** handles changing a cell: update board & determine if winner */
  flipCellsAround = (coord, e) => {
    const state = { ...this.state };
    let { board, steps, playing } = state;
    let hasWon;
    let [y, x] = coord.split("-").map(Number);

    board[y][x] = !board[y][x];
    if (board[y - 1]) board[y - 1][x] = !board[y - 1][x];
    if (board[x + 1]) board[y][x + 1] = !board[y][x + 1];
    if (board[x - 1]) board[y][x - 1] = !board[y][x - 1];
    if (board[y + 1]) board[y + 1][x] = !board[y + 1][x];
    steps++;

    hasWon = board.every(y => y.every(x => x === false));

    if (hasWon) {
      this.stopTimer();
      playing = false;
    }
    this.setState({ board, hasWon, steps, playing });
  };

  calculateScore = () => {
    // extract time from string
    const extractMsSec = timeString => {
      if (!timeString) timeString = "00:00:00";
      timeString = timeString.split(":");
      let intTimeString =
        parseInt(timeString[0]) * 3600 +
        parseInt(timeString[1] * 60 + parseInt(timeString[2]));

      return intTimeString / 1000;
    };

    // a = 2 rep score decrementing factor for every extra time
    // b = 3 rep score decrementing factor for every extra step

    const a = 2.5;
    const b = 1.5;

    let bestPlayTime = extractMsSec(this.props.bestPlayTime);
    let stateTime = extractMsSec(this.state.time);

    // formula from https://gamedev.stackexchange.com/questions/20636/score-based-on-game-play-time-and-a-int
    let timeScore =
      this.props.timeScoreBase * a ** Number(bestPlayTime - stateTime);
    let stepScore =
      this.props.stepScoreBase *
      b ** Number(this.props.bestStepCount - this.state.steps);

    return Math.floor(Math.sqrt(timeScore * stepScore));
  };

  // play game, reset state
  play = () => {
    this.stopTimer();
    this.setState({
      board: chance(this.props.nrows, this.props.ncols),
      steps: 0,
      score: 0,
      time: this.showTime(0, 0, 0, 0),
      timeout: false,
      hasWon: false,
      playing: true,
      pause: false
    });
  };

  restart = () => this.play();

  // sometime it may matter to use locale date functions for set timer
  startTimer = () => {
    let startTime;
    startTime = new Date();
    let timeDiff = new Date() - startTime;
    timeDiff /= 1000;
    this.setState({ time: timeDiff });
  };

  // handles timer and clear interval after timeout
  showTime = (hh, mm, ss, xx) => {
    let time;
    this.timer = setInterval(() => {
      xx++;
      ss = xx % 60;
      mm = Math.floor(xx / 60);
      hh = Math.floor(xx / 3600);

      ss = ss.toString().padStart(2, "0");
      mm = mm.toString().padStart(2, "0");
      hh = hh.toString().padStart(2, "0");

      time = `${hh}:${mm}:${ss}`;
      if (time <= this.props.timeout) {
        this.setState({ time });
        return time;
      } else {
        this.setState({ timeout: true, playing: false, hasWon: false });
        clearInterval(this.timer);
      }
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
  };

  /** Render game board or winning message or timeout. */

  render() {
    const { ncols, nrows } = this.props;

    const coverStyle = {
      height: `${ncols + 0.25}em`,
      width: `${nrows + 0.25}em`,
      fontSize: `${5}em`,
      margin: "auto",
      left: `calc(50% - ${nrows / 2 + 0.15}em)`
    };

    const coverStyle2 = { ...coverStyle };

    coverStyle2.lineHeight = `${ncols}em`;

    const { playing, time, timeout } = this.state;
    return (
      <div className="Board">
        <h1>Light Out!</h1>
        {!playing && !timeout ? (
          <div className="Board-cover playing" style={coverStyle2}>
            <span onClick={this.play} role="img" aria-label="play">
              ▶️
            </span>
            <span className="Board-info">
              <div className="Board-info-tab">
                <input type="checkbox" id="info" />
                <label className="tab-label" htmlFor="info">
                  How to play
                </label>
                <div className="tab-content">
                  <p>
                    Lights Out is a puzzle game, played on a grid of individual
                    light which can either be lit or unlit.
                  </p>
                  The puzzle is won when all the lights are turned off. You can
                  click on a cell to toggle that light -- but it also toggles
                  the light above it, to the left of it, to the right of it and
                  below it. (Cells on an edge or in the corner won't flip as
                  many lights since they are missing some neighbors).
                </div>
              </div>
            </span>
          </div>
        ) : !playing && timeout ? (
          <div className="Board-cover timeout" style={coverStyle}>
            <h2>Timeout!!! {time}</h2>
            <span onClick={this.restart} role="img" aria-label="replay">
              🔄
            </span>
          </div>
        ) : (
          ""
        )}
        {/* <button onClick={this.stopTimer}>Stop timer</button> */}
        {this.state.hasWon && !this.state.timeout && (
          <div className="Board-cover won" style={coverStyle}>
            <h2>You Won</h2>
            <iframe
              src="https://giphy.com/embed/1dMNqVx9Kb12EBjFrc"
              frameBorder="0"
              className="giphy-embed won-giphy"
              title="won"
            ></iframe>
            <p>Total Steps: {this.state.steps}</p>
            <p>Score: {this.calculateScore(this.state.steps)}</p>
            <span onClick={this.play} role="img" aria-label="replay">
              🔄
            </span>
          </div>
        )}

        {playing && !timeout && <p>Time: {time}</p>}
        <table>
          <tbody>
            {this.state.board.map((row, _) => (
              <tr key={_}>
                {row.map((col, __) => (
                  <Cell
                    key={__}
                    chord={`${_}-${__}`}
                    isLit={this.state.board[_][__]}
                    flipCellsAroundMe={this.flipCellsAround}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Board;
