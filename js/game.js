const MIND = '💣';
const FLAG = '🚩';
var gLevel = { size: 0, mines: 0 };
var gBoard;
var gGame;
var gGameInterval;
var totalSeconds;
var minesLocation = [];
var isFirstCell;
var gLives;
var gCountLostlives;
var gcountSafeClicks;
var gcountHintClicks;
var isHintIsOn;
var secondsLabel = document.getElementById('seconds');
window.addEventListener('contextmenu', (e) => e.preventDefault());
myStorage = window.localStorage;

localStorage.setItem('level4', Infinity);
localStorage.setItem('level8', Infinity);
localStorage.setItem('level12', Infinity);

function initGame(size) {
  showBestScore(size);
  isHintIsOn = false;
  gcountSafeClicks = 3;
  gcountHintClicks = 3;
  isFirstCell = true;
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

  secondsLabel.innerText = '000';
  document.querySelector('.status').innerText = '';
  document.querySelector('img').src = 'img/smiley.png';
}

function showBestScore(size) {
  if (size === 4 && +localStorage.getItem('level4') !== Infinity)
    document.querySelector('#Best4').innerText = localStorage.getItem('level4');
  else if (size === 8 && +localStorage.getItem('level8') !== Infinity)
    document.querySelector('#Best4').innerText = localStorage.getItem('level8');
  else if (size === 12 && +localStorage.getItem('level12') !== Infinity)
    document.querySelector('#Best4').innerText = localStorage.getItem('level12');
  else {
    console.log('hello');
    document.querySelector('#Best4').innerText = '';
  }
}

function showLives() {
  document.querySelector('#hint').innerText = gcountHintClicks;

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

function putRandMines(rowi, rowj) {
  var mines = gLevel.mines;
  var emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (
        (i === rowi - 1 && j === rowj - 1) ||
        (i === rowi - 1 && j === rowj) ||
        (i === rowi - 1 && j === rowj + 1) ||
        (i === rowi && j === rowj - 1) ||
        (i === rowi && j === rowj) ||
        (i === rowi && j === rowj + 1) ||
        (i === rowi + 1 && j === rowj - 1) ||
        (i === rowi + 1 && j === rowj) ||
        (i === rowi + 1 && j === rowj + 1)
      )
        continue;
      emptyCells.push({ i, j });
    }
  }
  while (mines > 0) {
    var location = getRandomInt(0, emptyCells.length - 1);
    gBoard[emptyCells[location].i][emptyCells[location].j].isMine = true;
    minesLocation.push({ i: emptyCells[location].i, j: emptyCells[location].j });
    emptyCells.splice(location, 1);
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
  //return to hint if it is on
  if (isHintIsOn) {
    hint(cellI, cellJ, true);

    return;
  }
  //First step
  if (isFirstCell && event.button === 0 && !cell.isMarked) {
    if (!gGameInterval) gGameInterval = setInterval(setTime, 1000);
    gGame.shownCount++;
    elCell.classList.add('mark');
    cell.isShown = true;
    putRandMines(cellI, cellJ);
    expandShown(cellI, cellJ);
    isFirstCell = false;
  } else {
    if (gGame.isOn && !cell.isShown) {
      switch (event.button) {
        case 0:
          if (!cell.isMarked) {
            movePlay(elCell, cellI, cellJ);
          }
          break;
        case 2:
          cellMarked(elCell, cellI, cellJ);
          break;
      }
    }
  }
}

//Turn On/Off the FLAG
function cellMarked(elCell, cellI, cellJ) {
  var cell = gBoard[cellI][cellJ];
  if (!cell.isShown) {
    cell.isMarked = !cell.isMarked ? true : false;
    elCell.innerText = cell.isMarked ? FLAG : '';
    gGame.markedCount += cell.isMarked ? +1 : -1;
    checkGameOver();
  }
}

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
  // gGame.shownCount++;

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

//showing neighbors (~~recursion)
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
        // console.log(gGame.shownCount);
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
  if (!gGame.isOn) {
    text = 'YOU LOST!!!!!';
    img = 'img/sad1.png';
  } else if (
    gGame.shownCount === Math.pow(gLevel.size, 2) - gLevel.mines &&
    Math.pow(gLevel.size, 2) === gCountLostlives + gGame.shownCount + gGame.markedCount
  ) {
    text = 'YOU WON';
    img = 'img/cool.png';
    keepBestScore();
  }
  if (text && img) {
    document.querySelector('.status').innerText = text;
    document.querySelector('img').src = img;
    clearInterval(gGameInterval);
    gGameInterval = null;
    gGame.isOn = false;
  }
}

function keepBestScore() {
  if (+secondsLabel.innerText < +localStorage.getItem(`level${gLevel.size}`)) {
    if (gLevel.size === 4) localStorage.level4 = +secondsLabel.innerText;
    else if (gLevel.size === 8) localStorage.level8 = +secondsLabel.innerText;
    else localStorage.level12 = +secondsLabel.innerText;
    document.querySelector('#Best4').innerText = localStorage.getItem(`level${gLevel.size}`);
  }
}

function hint(cellI, cellJ, clickedOnBoard = false) {
  isHintIsOn = true;
  if (gcountHintClicks > 0 && gGame.isOn && clickedOnBoard) {
    negsShow(cellI, cellJ, true);
    setTimeout(() => {
      gcountHintClicks--;
      document.querySelector('#hint').innerText = gcountHintClicks;
      negsShow(cellI, cellJ, false);
      isHintIsOn = false;
    }, 1000);
  } else if (gcountHintClicks === 0) isHintIsOn = false;
}
//if status=true ->Showing for 1 seconds the neighbors of the cell clicked
//if status=false returning everythins to previos state
function negsShow(rowIdx, colIdx, status) {
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      var cell = gBoard[i][j];
      var currCellDom = document.querySelector(`.cell-${i}-${j}`);
      if (status) {
        // if hint is on->showing all
        var text = '';
        if (cell.isMine) text = MIND;
        else if (cell.minesAroundCount > 0) text = cell.minesAroundCount;
        currCellDom.innerText = text;
        currCellDom.classList.add('mark');
      } else {
        //hint is over close what was closed and put back flag if was
        if (cell.isMarked) {
          currCellDom.classList.remove('mark');
          currCellDom.innerText = FLAG;
        } else if (!cell.isShown) {
          currCellDom.classList.remove('mark');
          currCellDom.innerText = '';
        }
      }
    }
  }
}
function safeClicks() {
  if (gcountSafeClicks > 0 && gGame.isOn) {
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
