document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const cells = document.querySelectorAll('.cell');
  const status = document.getElementById('status');
  const restartButton = document.getElementById('restart');
  const playerScoreElement = document.getElementById('player-score');
  const aiScoreElement = document.getElementById('ai-score');

  // Sound elements
  const clickSound = document.getElementById('click-sound');
  const winSound = document.getElementById('win-sound');
  const loseSound = document.createElement('audio'); // Added lose sound
  loseSound.id = 'lose-sound';
  loseSound.src = 'boo-6377.mp3'; // Using the boo sound from sounds directory
  document.body.appendChild(loseSound); //Append lose sound
  const drawSound = document.getElementById('draw-sound');
  const aiMoveSound = document.getElementById('ai-move-sound');

  let gameActive = true;
  let currentPlayer = 'X';
  let gameState = ['', '', '', '', '', '', '', '', ''];
  let scores = {
    player: 0,
    ai: 0
  };

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  // Handle cell click
  function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell is already taken or game is over
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
      return;
    }

    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play();

    // Update the game state and UI
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = ''; // Clear text content
    clickedCell.classList.add(currentPlayer.toLowerCase());

    // Check for win or draw
    if (checkWin()) {
      winSound.currentTime = 0;
      winSound.play(); // Play clap sound when player wins
      scores.player++;
      playerScoreElement.textContent = scores.player;
      status.textContent = `Player ${currentPlayer} wins!`;
      gameActive = false;
      setTimeout(() => {
        restartGame();
      }, 2000); // Auto-restart after win
      return;
    }

    if (checkDraw()) {
      drawSound.currentTime = 0;
      drawSound.play();
      status.textContent = "Game ended in a draw!";
      gameActive = false;

      // Auto-restart after a delay
      setTimeout(() => {
        restartGame();
      }, 2000);

      return;
    }

    // Switch player
    currentPlayer = 'O';
    status.textContent = "AI is thinking...";

    // Disable board clicks while AI is thinking
    board.classList.add('disabled');

    // AI makes a move after a small delay to simulate "thinking"
    setTimeout(() => {
      if (gameActive) {
        makeAiMove();
      }
      // Re-enable board clicks after AI's move
      board.classList.remove('disabled');
    }, 600);
  }

  // AI logic
  function makeAiMove() {
    // First check if AI can win in the next move
    const winMove = findWinningMove('O');
    if (winMove !== -1) {
      makeMove(winMove);
      return;
    }

    // Then check if player can win in the next move and block
    const blockMove = findWinningMove('X');
    if (blockMove !== -1) {
      makeMove(blockMove);
      return;
    }

    // Try to take the center if available
    if (gameState[4] === '') {
      makeMove(4);
      return;
    }

    // Try to take corners
    const availableCorners = [0, 2, 6, 8].filter(idx => gameState[idx] === '');
    if (availableCorners.length > 0) {
      makeMove(availableCorners[Math.floor(Math.random() * availableCorners.length)]);
      return;
    }

    // Take any available space
    const availableMoves = gameState.map((val, idx) => val === '' ? idx : -1).filter(idx => idx !== -1);
    if (availableMoves.length > 0) {
      makeMove(availableMoves[Math.floor(Math.random() * availableMoves.length)]);
    }
  }

  // Helper function for AI to find winning moves
  function findWinningMove(player) {
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === '') {
        // Try this move
        gameState[i] = player;
        // Check if it's a winning move
        const isWinningMove = winningConditions.some(condition => {
          return condition.every(index => gameState[index] === player);
        });
        // Undo the move
        gameState[i] = '';

        if (isWinningMove) {
          return i;
        }
      }
    }
    return -1;
  }

  // Make a move at the specified index
  function makeMove(index) {
    // Play AI move sound
    aiMoveSound.currentTime = 0;
    aiMoveSound.play();

    gameState[index] = currentPlayer;
    cells[index].textContent = ''; // Clear text content
    cells[index].classList.add(currentPlayer.toLowerCase());

    if (checkWin()) {
      if (currentPlayer === 'O') {
        // Play boo sound when AI wins
        loseSound.currentTime = 0;
        loseSound.play();
        scores.ai++;
        aiScoreElement.textContent = scores.ai;
      } else {
        // Play clap sound when player wins
        winSound.currentTime = 0;
        winSound.play();
        scores.player++;
        playerScoreElement.textContent = scores.player;
      }

      status.textContent = `${currentPlayer === 'O' ? 'AI' : 'Player'} wins!`;
      gameActive = false;
      setTimeout(() => {
        restartGame();
      }, 2000); // Auto-restart after win
      return;
    }

    if (checkDraw()) {
      drawSound.currentTime = 0;
      drawSound.play();
      status.textContent = "Game ended in a draw!";
      gameActive = false;

      // Auto-restart after a delay
      setTimeout(() => {
        restartGame();
      }, 2000);

      return;
    }

    currentPlayer = 'X';
    status.textContent = "Your turn (X)";
  }

  // Check if there's a winner
  function checkWin() {
    return winningConditions.some(condition => {
      return condition.every(index => gameState[index] === currentPlayer);
    });
  }

  // Check if it's a draw
  function checkDraw() {
    return !gameState.includes('');
  }

  // Restart the game
  function restartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = "Your turn (X)";
    board.classList.remove('disabled');
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x');
      cell.classList.remove('o');
    });
  }

  // Add event listeners
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });

  restartButton.addEventListener('click', restartGame);
});
