const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; 
const tileCount = canvas.width / gridSize;

let snake;
let food;
let direction;
let newDirection;
let score;
let gameRequestId;
let lastRenderTime = 0; // Tempo da última renderização
const snakeSpeed = 100; // Velocidade da cobra em milissegundos

document.addEventListener('keydown', changeDirection);
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

function startGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood(); // Modificado para evitar colisões com a cobra
    direction = { x: 0, y: 0 }; // Inicialmente sem movimento
    newDirection = { x: 0, y: 0 };
    score = 0;
    document.getElementById('score').textContent = 'Score: ' + score;

    // Mostrar o botão de reinício e esconder o botão de iniciar
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';

    // Garantir que o loop de animação esteja rodando
    if (gameRequestId) {
        cancelAnimationFrame(gameRequestId);
    }

    gameRequestId = requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    const timeSinceLastRender = currentTime - lastRenderTime;

    // Atualizar a tela a uma taxa fixa (a cada snakeSpeed milissegundos)
    if (timeSinceLastRender < snakeSpeed) {
        gameRequestId = requestAnimationFrame(gameLoop);
        return;
    }

    lastRenderTime = currentTime;

    // Verificar se o jogo acabou
    if (checkGameOver()) {
        alert('Game Over! Your score was: ' + score);
        // Mostrar botão de reinício e esconder o botão de iniciar
        document.getElementById('restartButton').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';
        return; // Para a execução do loop
    }

    // Atualizar a direção com base na nova direção
    if (direction.x !== newDirection.x || direction.y !== newDirection.y) {
        // Evitar a direção oposta imediata
        if (newDirection.x === -direction.x && newDirection.y === -direction.y) {
            // Não permitir direção oposta imediata
            newDirection = direction;
        } else {
            direction = newDirection;
        }
    }

    moveSnake();

    // Verificar se a cobra comeu a comida
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        document.getElementById('score').textContent = 'Score: ' + score;
        snake.push({ ...snake[snake.length - 1] }); // Adiciona um segmento à cauda
        food = generateFood(); // Gerar nova posição de comida
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawSnake();

    // Continuar o loop de animação
    gameRequestId = requestAnimationFrame(gameLoop);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function moveSnake() {
    // Adicionar nova cabeça à cobra
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); // Adiciona a nova cabeça à cobra

    // Remove a cauda da cobra se não estiver comido
    if (snake[0].x !== food.x || snake[0].y !== food.y) {
        snake.pop();
    }
}

function changeDirection(event) {
    const keyPressed = event.key;

    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingRight = direction.x === 1;
    const goingLeft = direction.x === -1;

    // Atualizar a direção com base nas teclas WASD
    if (keyPressed === 'a' && !goingRight) {
        newDirection = { x: -1, y: 0 };
    }
    if (keyPressed === 'w' && !goingDown) {
        newDirection = { x: 0, y: -1 };
    }
    if (keyPressed === 'd' && !goingLeft) {
        newDirection = { x: 1, y: 0 };
    }
    if (keyPressed === 's' && !goingUp) {
        newDirection = { x: 0, y: 1 };
    }

    console.log('New Direction:', newDirection); // Depuração
}

function generateFood() {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    return newFoodPosition;
}

function checkGameOver() {
    // Checar se a cobra bateu nela mesma
    for (let i = 1; i < snake.length; i++) {
        console.log(`Checking collision: Head (${snake[0].x}, ${snake[0].y}) vs Segment ${i} (${snake[i].x}, ${snake[i].y})`);
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            console.log('Game Over: Collision with self');
            return true;
        }
    }

    // Checar se a cobra saiu dos limites
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        console.log('Game Over: Out of bounds');
        return true;
    }

    return false;
}
