function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getEmptyCells(mat) {
  var emptyCells = [];
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat[i].length; j++) {
      var currCell = gBoard[i][j];
      if (!currCell.isMine && !currCell.isShown) emptyCells.push({ i, j });
    }
  }
  return emptyCells;
}

function renderBoard(mat) {
  var strHTML = '';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var data = '';
      var className = `cell cell-${i}-${j}`;
      strHTML += `<td  onmousedown="cellClicked(event,this , ${i}, ${j})"  class="${className}  "> ${data}</td>`;
    }
    strHTML += '</tr>';
  }
  //   oncontextmenu="event.preventDefault()"
  var elContainer = document.querySelector('.board');
  elContainer.innerHTML = strHTML;
}

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + '';
  if (valString.length < 2) {
    return '0' + valString;
  } else {
    return valString;
  }
}
