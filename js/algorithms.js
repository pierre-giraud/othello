/***************************************************
 * Fonctions de recherche de la meilleure solution *
 ***************************************************/

// ALGORITHMES DE RECHERCHES DE SOLUTIONS GAGNANTES
// Les algorithmes implémentés sont ceux étudiés en cours de Théorie des Jeux

// Fonction de recherche de solution pour une IA niveau débutante
// Elle effectue simplement un déplacement aléatoire disponible dans possibleMoves
function randomMove() {
    let random = Math.floor(Math.random() * (Object.keys(possibleMoves).length));
    return Object.keys(possibleMoves)[random];
}

// Fonction minimax remaniée
function minimax(depth, node){
    if (gameOver || depth === 0) return heuristique();

    // Enregistre l'état actuel du jeu à chaque étape de l'algorithme afin d'affectuer plus tard le retour arrière
    let initialState = JSON.parse(JSON.stringify(virtualBoard));
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves));
    let initialGameOver = gameOver;
    let initialPlayer = currentPlayer;
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestScore; // Meilleur score obtenu (nombre de pions)
    let bestMove;  // Meilleur déplacement obtenu correspondant

    if (node === 'MAX'){
        bestScore = -Infinity;

        for (let m in initialPMoves){
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            let score = minimax(depth - 1, 'MIN');
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

            if (score > bestScore){
                bestScore = score;
                bestMove = m;
            }
        }
    } else {
        bestScore = Infinity;

        for (let m in initialPMoves) {
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            let score = minimax(depth - 1, 'MAX');
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

            if (score < bestScore){
                bestScore = score;
                bestMove = m;
            }
        }
    }

    moveAI = bestMove;

    return bestScore;
}

// Fonction AlphaBeta remaniée
function alphaBeta(depth, alpha, beta, node){
    if (gameOver || depth <= 0) return heuristique();

    // Enregistre l'état actuel du jeu à chaque étape de l'algorithme afin d'affectuer plus tard le retour arrière
    let initialState = JSON.parse(JSON.stringify(virtualBoard));
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves));
    let initialGameOver = gameOver;
    let initialPlayer = currentPlayer;
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestMove;  // Meilleur déplacement obtenu correspondant

    if (node === 'MAX'){
        for (let m in initialPMoves){
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            let score = alphaBeta(depth - 1, alpha, beta, 'MIN');
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

            if (score > alpha) {
                alpha = score;
                bestMove = m;

                if (alpha >= beta) break;
            }
        }

        moveAI = bestMove;

        return alpha;
    } else {
        for (let m in initialPMoves) {
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            let score = alphaBeta(depth - 1, alpha, beta, 'MAX');
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

            if (score < beta) {
                beta = score;
                bestMove = m;

                if (alpha >= beta) break;
            }
        }

        moveAI = bestMove;

        return beta;
    }
}

// Fonction alphabeta version NegaMax
function negAlphaBeta(depth, alpha, beta){
    if (gameOver || depth <= 0) return heuristique();

    // Enregistre l'état actuel du jeu à chaque étape de l'algorithme afin d'affectuer plus tard le retour arrière
    let initialState = JSON.parse(JSON.stringify(virtualBoard));
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves));
    let initialGameOver = gameOver;
    let initialPlayer = currentPlayer;
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestMove;  // Meilleur déplacement obtenu correspondant

    for (let m in initialPMoves) {
        if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
        let score = -negAlphaBeta(depth - 1, -beta, -alpha);
        unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

        if (score >= alpha) {
            alpha = score;
            bestMove = m;

            if (alpha >= beta) break;
        }
    }

    moveAI = bestMove;

    return alpha;
}


// ---------------------------------------------------------------------------------------------------------------
// Fonctions d'évaluation

// Gestion des fonctions d'évaluation
function heuristique(){
    if (gameMode === 'jvsia'){
        if (heuristique1 === 'nbpion') return evalNumberOfPieces();
        else if (heuristique1 === 'mobi') return evalMobility();
    } else {
        if (currentIA === 'noir'){
            if (heuristique1 === 'nbpion') return evalNumberOfPieces();
            else if (heuristique1 === 'mobi') return evalMobility();
        } else {
            if (heuristique2 === 'nbpion') return evalNumberOfPieces();
            else if (heuristique2 === 'mobi') return evalMobility();
        }
    }
}

// Evaluation par le nombre de pions total du joueur
function evalNumberOfPieces(){
    return currentIA === 'noir' ? nbBlackPieces : nbWhitePieces;
}

// Evaluation par la mobilité (nombre de pions mangés par le joueur)
function evalMobility(){
    return lastPossibleMoves[lastMove].length;
}