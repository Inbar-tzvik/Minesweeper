const MIND = '💣';
const FLAG = '🚩';
var gLevel = { size: 0, mines: 0 };
var gBoard;
var gGame;
var gGameInterval;
var totalSeconds;
var minesLocation = [];
var firstCell;
var gLives;
var gCountLostlives;
var gcountSafeClicks;

var minutesLabel = document.getElementById('minutes');
var secondsLabel = document.getElementById('seconds');
window.addEventListener('contextmenu', (e) => e.preventDefault());

function initGame(size) {
  gcountSafeClicks = 3;

  firstCell = true;
  totalSeconds = 0;
  clearInterval(gGameInterval);
  gGame = { isOn: true, shownCount: 0, markedCount: 0, secPassed: 0 };
  gGameInterval = null;
  gBoard = [];
  minesLocation = [];
  gCountLostlives = 0;
  gLives = 3;
  showLives();
  gLevel.size = size;
  // document.querySelector(`.lives3`).style.display = 'block';
  if (size === 4) {
    gLevel.mines = 2;
    gLives = 2;
    document.querySelector(`.lives3`).classList.add('hide');
  } else if (size === 8) gLevel.mines = 12;
  else gLevel.mines = 30;
  buildBoard(size);
  renderBoard(gBoard);
  minutesLabel.innerText = '00';
  secondsLabel.innerText = '00';
  document.querySelector('.status').innerText = '';
  document.querySelector('img').src = 'img/smiley.png';
}

function showLives() {
  document.querySelector('#clicks').innerText = gcountSafeClicks;

  document.querySelector(`.lives1`).classList.remove('hide');
  document.querySelector(`.lives2`).classList.remove('hide');
  document.querySelector(`.lives3`).classList.remove('hide');
}

function buildBoard(size) {
  gBoard = [];
  for (var i = 0; i < size; i++) {
    gBoard[i] = [];
    for (var j = 0; j < size; j++) {
      gBoard[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  //   putRandMines();
}

function putRandMines() {
  var mines = gLevel.mines;
  var emptyCells = [];

  while (mines > 0) {
    emptyCells = [...getEmptyCells(gBoard)];
    var location = getRandomInt(0, emptyCells.length - 1);
    gBoard[emptyCells[location].i][emptyCells[location].j].isMine = true;
    minesLocation.push({ i: emptyCells[location].i, j: emptyCells[location].j });
    mines--;
  }
  overBoard();
}

function overBoard() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (gBoard[i][j].isMine) continue;
      setMinesNegsCount(i, j);
    }
  }
}

function setMinesNegsCount(rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var currCell = gBoard[i][j];
      if (currCell.isMine) count++;
    }
  }
  gBoard[rowIdx][colIdx].minesAroundCount = count;

  if (count === 1) document.querySelector(`.cell-${rowIdx}-${colIdx}`).style.color = 'blue';
  else if (count === 2) document.querySelector(`.cell-${rowIdx}-${colIdx}`).style.color = 'green';
  else if (count === 3) document.querySelector(`.cell-${rowIdx}-${colIdx}`).style.color = 'red';
  else if (count === 4) document.querySelector(`.cell-${rowIdx}-${colIdx}`).style.color = 'DarkBlue';
}

function cellClicked(event, elCell, cellI, cellJ) {
  var cell = gBoard[cellI][cellJ];
  if (!gGameInterval) gGameInterval = setInterval(setTime, 1000);
  //First step
  if (firstCell && event.button === 0 && !cell.isMarked) {
    gGame.shownCount++;
    elCell.classList.add('mark');
    cell.isShown = true;
    putRandMines();
    firstCell = false;
  } else {
    if (gGame.isOn) {
      switch (event.button) {
        case 0:
          movePlay(elCell, cellI, cellJ);
          break;
        case 2:
          cellMarked(elCell, cellI, cellJ);
          break;
      }
    }
  }
}

//Turn On/Off the flag
function cellMarked(elCell, cellI, cellJ) {
  var cell = gBoard[cellI][cellJ];
  cell.isMarked = !cell.isMarked ? true : false;
  elCell.innerText = cell.isMarked ? FLAG : '';
  gGame.markedCount += cell.isMarked ? +1 : -1;
  checkGameOver();
}

//to be continued
function movePlay(elCell, i, j) {
  var cell = gBoard[i][j];
  if (cell.isMine) {
    stepOnMine(elCell, i, j);
    return;
  } else if (cell.minesAroundCount > 0 && !cell.isMarked) {
    elCell.innerText = cell.minesAroundCount;
    gGame.shownCount++;
    elCell.classList.add('mark');
    cell.isShown = true;
    // expandShown(i, j);
  } else {
    gGame.shownCount++;
    elCell.classList.add('mark');
    cell.isShown = true;
    expandShown(i, j);
    //checkSquare(elCell, cellI, cellJ)
  }
  checkGameOver();
}
// function checkSquare(elCell, i, j) {}

function stepOnMine(elCell, i, j) {
  elCell.innerText = MIND;
  elCell.style.backgroundColor = 'red';
  document.querySelector(`.lives${gLives}`).classList.add('hide');
  gLives--;
  gCountLostlives++;
  gBoard[i][j].isShown = true;
  gGame.shownCount++;

  if (!gLives) {
    for (var m = 0; m < minesLocation.length; m++) {
      locI = minesLocation[m].i;
      locj = minesLocation[m].j;
      document.querySelector(`.cell-${locI}-${locj}`).innerText = MIND;
      document.querySelector(`.cell-${locI}-${locj}`).classList.add('mark');
    }
    gGame.isOn = false;
  }
  checkGameOver();
}

//to be continued

//showing negs
function expandShown(rowIdx, colIdx) {
  var cell = gBoard[rowIdx][colIdx];
  if (!cell.isMine && !cell.minesAroundCount && !cell.isMarked) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > gBoard.length - 1) continue;
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
        if (j < 0 || j > gBoard[0].length - 1) continue;
        if (i === rowIdx && j === colIdx) continue;
        var currCell = gBoard[i][j];
        if (currCell.isMarked || currCell.isShown) continue;
        currCell.isShown = true;
        gGame.shownCount++;
        var cellDom = document.querySelector(`.cell-${i}-${j}`);
        cellDom.classList.add('mark');
        if (currCell.minesAroundCount > 0) cellDom.innerText = currCell.minesAroundCount;
        else {
          cellDom.innerText = '';
          expandShown(i, j);
        }
      }
    }
  }
}

function checkGameOver() {
  var text = null;
  var img = null;
  console.log(gGame.shownCount, gGame.markedCount);
  if (gCountLostlives === Math.pow(gLevel.size, 2) - gGame.shownCount - gGame.markedCount) {
    text = 'YOU WON';
    img = 'img/cool.png';
  } else if (!gGame.isOn) {
    text = 'YOU LOST!!!!!';
    img = 'img/sad1.png';
  }
  if (text && img) {
    document.querySelector('.status').innerText = text;
    document.querySelector('img').src = img;
    clearInterval(gGameInterval);
    gGameInterval = null;
    gGame.isOn = false;
  }
}

// function hint() {
//   input.onclick = function () {
//     console.log('hello');
//   };
//   setTimeout(() => {}, 1000);
// }

function safeClicks() {
  if (gcountSafeClicks > 0) {
    var emptyCells = getEmptyCells(gBoard);
    var location = getRandomInt(0, emptyCells.length - 1);
    var cell = document.querySelector(`.cell-${emptyCells[location].i}-${emptyCells[location].j}`);
    cell.classList.add('invalid-blink');
    setTimeout(() => {
      cell.classList.remove('invalid-blink');
    }, 2000);
    gcountSafeClicks--;
    document.querySelector('#clicks').innerText = gcountSafeClicks;
  }
}
