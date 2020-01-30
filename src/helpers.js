function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const chance = (nrows, ncols) => {
  const random = [0, 1, 1, 0, 0, 1];
  const boola = [false, true];
  let board = [];
  for (let i = 0; i < ncols; i++) board.push([]);

  for (let i = 0; i < nrows; i++) {
    for (let j = 0; j < ncols; j++) {
      board[i][j] = boola[random[getRandomInt(5)]];
    }
  }
  return board;
};

const superChance = (nrows, ncols) => {
  return [
    [false, false, false, false, false],
    [false, false, true, false, false],
    [false, true, true, true, false],
    [false, false, true, false, false],
    [false, false, false, false, false]
  ];
};

export { superChance, chance };
