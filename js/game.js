const MIND = '💣';
const FLAG = '🚩';
var gLevel = { size: 0, mines: 0 };
var gBoard;
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secPassed: 0 };
var gGameInterval;
var totalSeconds = 0;
var minesLocation = [];
var firstCell;
var minutesLabel = document.getElementById('minutes');
var secondsLabel = document.getElementById('seconds');
window.addEventListener('contextmenu', (e) => e.preventDefault());
// 😀🥴

function initGame(size) {
  firstCell = true;
  clearInterval(gGameInterval);
  gGameInterval = null;
  gBoard = [];
  minesLocation = [];
  gLevel.size = size;
  if (size === 4) gLevel.mines = 2;
  else if (size === 8) gLevel.mines = 12;
  else gLevel.mines = 30;
  buildBoard(size);
  renderBoard(gBoard);
  minutesLabel.innerText = '00';
  secondsLabel.innerText = '00';
  document.querySelector('.status').innerText = '';
  document.querySelector('img').src = 'img/smiley.png';
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

  while (mines > 0) {
    var emptyCells = getEmptyCells(gBoard);
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
}

function cellClicked(event, elCell, cellI, cellJ) {
  if (firstCell && event.button === 0) {
    elCell.classList.add('mark');
    putRandMines();
    firstCell = false;
  } else {
    if (!gGameInterval) gGameInterval = setInterval(setTime, 1000);
    var cell = gBoard[cellI][cellJ];
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

function cellMarked(elCell, cellI, cellJ) {
  if (gBoard[cellI][cellJ].isMarked) {
    elCell.innerText = '';
    gBoard[cellI][cellJ].isMarked = false;
  } else {
    gBoard[cellI][cellJ].isMarked = true;

    elCell.innerText = FLAG;
  }
}

//to be continued
function movePlay(elCell, i, j) {
  var cell = gBoard[i][j];
  if (gBoard[i][j].isMine) {
    elCell.innerText = MIND;
    elCell.style.backgroundColor = 'red';
    for (var m = 0; m < minesLocation.length; m++) {
      locI = minesLocation[m].i;
      locj = minesLocation[m].j;
      document.querySelector(`.cell-${locI}-${locj}`).innerText = MIND;
      document.querySelector(`.cell-${locI}-${locj}`).classList.add('mark');
    }
    clearInterval(gGameInterval);

    document.querySelector('.status').innerText = 'YOU LOST!!!!!';
    document.querySelector('img').src = 'img/sad1.png';
    return;
  }

  expandShown(elCell, i, j);

  if (cell.minesAroundCount > 0 && !cell.isMarked) {
    elCell.classList.add('mark');
    cell.isShown = true;
    elCell.innerText = cell.minesAroundCount;
  } else if (cell.minesAroundCount === 0 && !cell.isMarked) {
    elCell.classList.add('mark');
    // Update the Model:
    cell.isShown = true;
  }
  checkGameOver(elCell, i, j);
}

//to be continued

function expandShown(elCell, rowIdx, colIdx) {
  var cell = gBoard[rowIdx][colIdx];
  if (!cell.isMine && !cell.minesAroundCount) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i > gBoard.length - 1) continue;
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
        if (j < 0 || j > gBoard[0].length - 1) continue;
        if (i === rowIdx && j === colIdx) continue;
        var currCell = gBoard[i][j];
        currCell.isShown = true;
        var cellDom = document.querySelector(`.cell-${i}-${j}`);
        cellDom.classList.add('mark');
        if (currCell.minesAroundCount > 0) cellDom.innerText = currCell.minesAroundCount;
        else cellDom.innerText = '';
      }
    }
  }
}
//to be continued

function checkGameOver() {
  var shownCount = 0;
  var markedCount = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j];
      if (cell.isShown && !cell.isMarked && !cell.isMine) shownCount++;
      else markedCount++;
    }
  }
  if (shownCount === gLevel.size * gLevel.size - gLevel.mines) {
    document.querySelector('.status').innerText = 'YOU WON';
    document.querySelector('img').src = 'img/cool.png';
    clearInterval(gGameInterval);
  }
}
