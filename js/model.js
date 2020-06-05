/*************************************************************
 * Fonctions relatives au MODEL (partie mathématique du jeu) *
 *************************************************************/

// Initialisation du plateau
function initVirtualBoard(){
    // Création du tableau à deux dimensions
    virtualBoard = new Array(BOARD_SIZE);
    for (let i = 0; i < virtualBoard.length; ++i){
        virtualBoard[i] = new Array(BOARD_SIZE);
    }

    // Initialisation par rapport aux règles d'Othello
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

// Vérifie que les coordonnées x et y sont dans le plateau
function isInBoard(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

// Modifie le joueur courant, y compris s'il s'agit d'une IA
// isIA indique si le changement est réel ou un changement utilisé dans les algorithmes de recherche
function swapPlayer(isIA){
    currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir';
    possibleMoves = getPossibleMoves(); // Récupération des déplacements possibles par rapport au joueur courant

    // Si le joueur ne peut pas jouer et que l'autre peut continuer de jouer, on passe à l'autre
    if ($.isEmptyObject(possibleMoves)) {
        currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir';
        possibleMoves = getPossibleMoves();

        // Si l'autre joueur ne peut pas jouer non plus, la partie est finie
        if ($.isEmptyObject(possibleMoves)) gameOver = true;
    }

    // Si le changement ert réel et que le mode de jeu est IA contre IA, l'IA courante devient le nouveau joueur obtenu au dessus
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
        } else if (gameMode === 'iavsia') openAI = true;
    }

    // Si le changement est réel et que le joueur est une IA, on fait jouer l'IA
    if (openAI) {
        timeout = setTimeout(function () {
            //console.log("START IA");
            AIPlay();
        }, 2000);
    }
}

// MAJ du nombre de pièces pour chaque joueur
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

// Vérifie que des pions ennemis sont à proximité de la position de coordonnées row et col
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

    // On recherche des déplacements possibles pour chaque case du plateau
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // On regarde si la position est propice à la pose d'un pion (vide et à proximité de pions ennemis)
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

// Effectue un déplacement moveKey à partir de la case d'identifiant
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

    // Vérification du statut de la partie
    if (gameIsOver()) gameOver = true;

    // Changement de joueur
    swapPlayer(isIA);
}

// Le jeu retourne à un état précédent en remettant les données globales avec celles en paramètre
function unmakeMove(state, moves, over, player, lastmove){
    virtualBoard = JSON.parse(JSON.stringify(state));
    possibleMoves = JSON.parse(JSON.stringify(moves));
    lastPossibleMoves = JSON.parse(JSON.stringify(possibleMoves));
    gameOver = over;
    currentPlayer = player;
    lastMove = lastmove;
    updateNbPieces();
}

// Vérifie si la partie est finie (
function gameIsOver(){
    return (nbBlackPieces === 0 || nbWhitePieces === 0) || (nbWhitePieces + nbBlackPieces === 64);
}

// Met fin au jeu
function endGame(){
    clearInterval(timer); // Suppression du timer
    $('#timer').text("-- sec"); // Réinitialistion du temps affiché
    // Popup indiquant que la partie est finie
    alert("Partie terminée, le gagnant est le joueur " + ((nbWhitePieces > nbBlackPieces) ? "blanc" : "noir"));
}

// Fonction exécutée à la suite d'un clic où id est un déplacement
function executeClick(id){
    if (id in possibleMoves){
        // Application du déplacement
        makeMove(id, false);
        sec = SEC_TIMER; // Réinitialisation du temps restant

        // MAJ de la vue
        updateBoardView();
        updateNbPiecesView();

        // Vérification de la fin de partie
        if (gameOver) endGame();
    }
}

// Action d'une IA
function AIPlay(){
    clearTimeout(timeout);
    timeout = null;

    moveAI = "";

    // Gère l'accès à cette même méthode
    openAI = false;

    // Application d'algorithme de recherche en fonction du mode de jeu et de la difficulté
    let result;
    if (difficulty === 'easy') {
        moveAI = randomMove();
    } else if (difficulty === 'medium'){
        if (gameMode === 'jvsia') {
            if (algorithm1 === 'minimax') result = minimax(1, 'MAX');
            else if (algorithm1 === 'alphabeta') result = alphaBeta(1, -Infinity, Infinity, "MAX");
            else if (algorithm1 === 'negalphabeta') result = negAlphaBeta(1, -Infinity, Infinity);
        } else if (gameMode === 'iavsia'){
            if (currentIA === 'noir'){
                if (algorithm1 === 'minimax') result = minimax(1, 'MAX');
                else if (algorithm1 === 'alphabeta') result = alphaBeta(1, -Infinity, Infinity, "MAX");
                else if (algorithm1 === 'negalphabeta') result = negAlphaBeta(1, -Infinity, Infinity);
            } else {
                if (algorithm2 === 'minimax') result = minimax(1, 'MAX');
                else if (algorithm2 === 'alphabeta') result = alphaBeta(1, -Infinity, Infinity, "MAX");
                else if (algorithm2 === 'negalphabeta') result = negAlphaBeta(1, -Infinity, Infinity);
            }
        }
    } else {
        if (gameMode === 'jvsia'){
            if (algorithm1 === 'minimax') result = minimax(3, 'MAX');
            else if (algorithm1 === 'alphabeta') result = alphaBeta(3, -Infinity, Infinity, "MAX");
            else if (algorithm1 === 'negalphabeta') result = negAlphaBeta(3, -Infinity, Infinity);
        } else if (gameMode === 'iavsia'){
            if (currentIA === 'noir'){
                if (algorithm1 === 'minimax') result = minimax(3, 'MAX');
                else if (algorithm1 === 'alphabeta') result = alphaBeta(3, -Infinity, Infinity, "MAX");
                else if (algorithm1 === 'negalphabeta') result = negAlphaBeta(3, -Infinity, Infinity);
            } else {
                if (algorithm2 === 'minimax') result = minimax(3, 'MAX');
                else if (algorithm2 === 'alphabeta') result = alphaBeta(3, -Infinity, Infinity, "MAX");
                else if (algorithm2 === 'negalphabeta') result = negAlphaBeta(3, -Infinity, Infinity);
            }
        }
    }

    // Exécution d'un clic correspondant au déplacement obtenu
    executeClick(moveAI);
}