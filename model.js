/*************************************************************
 * Fonctions relatives au MODEL (partie mathématique du jeu) *
 *************************************************************/

// Initialisation du plateau
function initVirtualBoard(){
    // Création
    virtualBoard = new Array(BOARD_SIZE);
    for (let i = 0; i < virtualBoard.length; ++i){
        virtualBoard[i] = new Array(BOARD_SIZE);
    }

    // Initialisation par rapport à la situation actuelle du jeu
    for (let i = 0; i < BOARD_SIZE; ++i){
        for (let j = 0; j < BOARD_SIZE; ++j){
            virtualBoard[i][j] = 'vide';
        }
    }

    virtualBoard[3][3] = 'blanc';
    virtualBoard[3][4] = 'noir';
    virtualBoard[4][3] = 'noir';
    virtualBoard[4][4] = 'blanc';

    possibleMoves = getPossibleMoves();
}

// Vérifie que les coordonnées sont dans le plateau
function isInBoard(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

// Modifie le joueur virtuel courant  ( A FAIRE : REVOIR LE CHANGEMENT DE JOUEUR AVEC IA QUAND IA GAGNE)
function swapPlayer(isIA){
    currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir';
    possibleMoves = getPossibleMoves();

    // Si le joueur ne peut pas jouer et que l'autre peut continuer de jouer, on passe à l'autre
    if ($.isEmptyObject(possibleMoves)) {
        currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir';
        possibleMoves = getPossibleMoves();

        if ($.isEmptyObject(possibleMoves)) gameOver = true;
    }

    if (!isIA && gameMode === 'iavsia') currentIA = currentPlayer;

    // Gestion des IAs
    if (!isIA && gameMode !== 'jvsj'){
        if (gameMode === 'jvsia'){
            if (currentPlayer === 'blanc') {
                openAI = true;
                playerCanClick = false;
            } else {
                playerCanClick = true;
            }
        }
        //if (gameMode === 'jvsia' && currentPlayer === 'blanc') openAI = true;
        else if (gameMode === 'iavsia') openAI = true;
    }

    // Si le joueur est une IA
    if (openAI) {
        timeout = setTimeout(function () {
            //console.log("START IA");
            AIPlay();
        }, 2000);
    }
}

// MAJ du nombre de pièces
function updateNbPieces(){
    nbBlackPieces = 0;
    nbWhitePieces = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (virtualBoard[row][col] === 'noir') nbBlackPieces++;
            else if (virtualBoard[row][col] === 'blanc') nbWhitePieces++;
        }
    }
}

// Vérifie que des pions ennemis sont à proximité
function isCloseEnemyPiece(row, col){
    let enemy = currentPlayer === 'blanc' ? 'noir' : 'blanc';

    return (isInBoard(row - 1, col) && virtualBoard[row-1][col] === enemy)
        || (isInBoard(row - 1, col - 1) && virtualBoard[row-1][col-1] === enemy)
        || (isInBoard(row, col - 1) && virtualBoard[row][col-1] === enemy)
        || (isInBoard(row + 1, col - 1) && virtualBoard[row+1][col-1] === enemy)
        || (isInBoard(row + 1, col) && virtualBoard[row+1][col] === enemy)
        || (isInBoard(row + 1, col + 1) && virtualBoard[row+1][col+1] === enemy)
        || (isInBoard(row, col + 1) && virtualBoard[row][col+1] === enemy)
        || (isInBoard(row - 1, col + 1) && virtualBoard[row-1][col+1] === enemy);
}

// Retourne l'ensemble des déplacements possibles pour le joueur courant
function getPossibleMoves(){
    let moves = {};

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // On regarde si la position est propice à la pose d'un pion
            if (virtualBoard[row][col] === 'vide' && isCloseEnemyPiece(row, col)) {
                let coords = [];
                let temp;

                // Recherche des pions à gauche
                if (col > 1) {
                    temp = [];
                    for (let y = col - 1; y >= 0; y--) {
                        if (virtualBoard[row][y] === 'vide') break;
                        else if (virtualBoard[row][y] === currentPlayer && y === col - 1) break;
                        else if (virtualBoard[row][y] === currentPlayer) {
                            coords.push.apply(coords, temp);
                            break;
                        } else temp.push({row: row, col: y});
                    }
                }

                // Recherche des pions à droite
                if (col < BOARD_SIZE - 1) {
                    temp = [];
                    for (let y = col + 1; y < BOARD_SIZE; y++) {
                        if (virtualBoard[row][y] === 'vide') break;
                        else if (virtualBoard[row][y] === currentPlayer && y === col + 1) break;
                        else if (virtualBoard[row][y] === currentPlayer) {
                            coords.push.apply(coords, temp);
                            break;
                        } else temp.push({row: row, col: y});
                    }
                }

                // Recherche des pions en haut
                if (row > 1) {
                    temp = [];
                    for (let x = row - 1; x >= 0; x--) {
                        if (virtualBoard[x][col] === 'vide') break;
                        else if (virtualBoard[x][col] === currentPlayer && x === row - 1) break;
                        else if (virtualBoard[x][col] === currentPlayer) {
                            coords.push.apply(coords, temp);
                            break;
                        } else temp.push({row: x, col: col});
                    }
                }

                // Recherche des pions en bas
                if (row < BOARD_SIZE - 1) {
                    temp = [];
                    for (let x = row + 1; x < BOARD_SIZE; x++) {
                        if (virtualBoard[x][col] === 'vide') break;
                        else if (virtualBoard[x][col] === currentPlayer && x === row + 1) break;
                        else if (virtualBoard[x][col] === currentPlayer) {
                            coords.push.apply(coords, temp);
                            break;
                        } else temp.push({row: x, col: col});
                    }
                }

                // Recherche des pions en haut à gauche
                if (row > 1 && col > 1) {
                    let y = col - 1;
                    temp = [];
                    for (let x = row - 1; x >= 0; x--) {
                        if (y >= 0) {
                            if (virtualBoard[x][y] === 'vide') break;
                            else if (virtualBoard[x][y] === currentPlayer && x === row - 1 && y === col - 1) break;
                            else if (virtualBoard[x][y] === currentPlayer) {
                                coords.push.apply(coords, temp);
                                break;
                            } else temp.push({row: x, col: y});
                            --y;
                        } else break;
                    }
                }

                // Recherche des pions en bas à gauche
                if (row < BOARD_SIZE - 1 && col > 1) {
                    let y = col - 1;
                    temp = [];
                    for (let x = row + 1; x < BOARD_SIZE; x++) {
                        if (y >= 0) {
                            if (virtualBoard[x][y] === 'vide') break;
                            else if (virtualBoard[x][y] === currentPlayer && x === row + 1 && y === col - 1) break;
                            else if (virtualBoard[x][y] === currentPlayer) {
                                coords.push.apply(coords, temp);
                                break;
                            } else temp.push({row: x, col: y});
                            --y;
                        } else break;
                    }
                }

                // Recherche des pions en haut à droite
                if (row > 1 && col < BOARD_SIZE - 1) {
                    let y = col + 1;
                    temp = [];
                    for (let x = row - 1; x >= 0; x--) {
                        if (y < BOARD_SIZE) {
                            if (virtualBoard[x][y] === 'vide') break;
                            else if (virtualBoard[x][y] === currentPlayer && x === row - 1 && y === col + 1) break;
                            else if (virtualBoard[x][y] === currentPlayer) {
                                coords.push.apply(coords, temp);
                                break;
                            } else temp.push({row: x, col: y});
                            ++y;
                        } else break;
                    }
                }

                // Recherche des pions en bas à droite
                if (row < BOARD_SIZE - 1 && col < BOARD_SIZE - 1) {
                    let y = col + 1;
                    temp = [];
                    for (let x = row + 1; x < BOARD_SIZE; x++) {
                        if (y < BOARD_SIZE) {
                            if (virtualBoard[x][y] === 'vide') break;
                            else if (virtualBoard[x][y] === currentPlayer && x === row + 1 && y === col + 1) break;
                            else if (virtualBoard[x][y] === currentPlayer) {
                                coords.push.apply(coords, temp);
                                break;
                            } else temp.push({row: x, col: y});
                            ++y;
                        } else break;
                    }
                }

                // Ajout de la position et de la liste de coordonnées
                if (coords.length > 0) moves[row + "x" + col] = coords;
            }
        }
    }

    return moves;
}

// Effectue un déplacement
function makeMove(moveKey, isIA) {
    let coords = moveKey.split('x');

    // Changement de couleur des pions ennemis
    for (let move of possibleMoves[moveKey]){
        virtualBoard[move.row][move.col] = currentPlayer;
    }

    // Ajout du pion sur la case cliquée
    virtualBoard[coords[0]][coords[1]] = currentPlayer;

    // Sauvegarde du dernier coup joué
    lastMove = moveKey;

    // MAJ du nombre de pièces
    updateNbPieces();

    if (gameIsOver()) gameOver = true;

    swapPlayer(isIA);
}

// Retourne à un état du plateau
function unmakeMove(state, moves, over, player){
    virtualBoard = JSON.parse(JSON.stringify(state));  // Deep copy
    possibleMoves = JSON.parse(JSON.stringify(moves)); // Deep copy
    lastPossibleMoves = JSON.parse(JSON.stringify(possibleMoves));
    gameOver = over;
    currentPlayer = player;
    updateNbPieces();
}

// Retourne si la partie doit se finir
function gameIsOver(){
    return (nbBlackPieces === 0 || nbWhitePieces === 0) || (nbWhitePieces + nbBlackPieces === 64);
}

// Met fin au jeu
function endGame(){
    clearInterval(timer);
    $('#timer').text("-- sec");
    alert("Partie terminée, le gagnant est le joueur " + ((nbWhitePieces > nbBlackPieces) ? "blanc" : "noir"));
}

// Fonction appelée lors d'un click
function executeClick(id){
    if (id in possibleMoves){
        // Application du déplacement
        makeMove(id, false);
        sec = SEC_TIMER;

        // MAJ de la vue
        updateBoardView();
        updateNbPiecesView();

        // Vérification de la fin de partie
        if (gameOver) endGame();

        // Reset du timer
        //clearInterval(timer);
        //timer = initTimer();
    }
}

// Action d'une IA
function AIPlay(){
    clearTimeout(timeout);
    timeout = null;

    moveAI = "";

    // Gère l'accès à cette même méthode
    openAI = false;

    // Application d'algorithme de recherche en fonction de la difficulté
    let result;
    if (difficulty === 'easy') {
        moveAI = randomMove();
    } else if (difficulty === 'medium'){
        //result = minimax(1, 'MAX');
        result = alphaBeta(1, -Infinity, Infinity, "MAX");
        //result = negAlphaBeta(1, -Infinity, Infinity);
    } else {
        result = minimax(3, 'MAX');
        result = alphaBeta(3, -Infinity, Infinity, "MAX");
        //result = negAlphaBeta(3, -Infinity, Infinity);
    }

    // Exécution d'un click correspondant au déplacement obtenu
    executeClick(moveAI);
}