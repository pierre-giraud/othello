/***************************************************
 * Fonctions de recherche de la meilleure solution *
 ***************************************************/

// ALGORITHMES DE RECHERCHES DE SOLUTIONS GAGNANTES
// Les algorithmes implémentés sont ceux étudiés en cours de Théorie des Jeux

// Fonction de recherche de solution pour une IA niveau débutante (position aléatoire)
function randomMove() {
    let random = Math.floor(Math.random() * (Object.keys(possibleMoves).length));
    return Object.keys(possibleMoves)[random];
}

// Fonction minimax remaniée
function minimax(depth, node){
    if (gameOver || depth === 0){
        //return currentIA === 'noir' ? {score: nbBlackPieces, move: null} : {score: nbWhitePieces, move: null}; // Heuristique 1 (IA maximise ses gain alors que l'adversaire les minimise)
        //return evalNumberOfPieces();  // Heuristique 1 (IA maximise ses gain alors que l'adversaire les minimise (ceux de l'IA)) : Nombre de pions sur la othellier
        return evalMobility(); // Heuristique 2 : mobilité
    }

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
    //return {score: bestScore, move: bestMove};
}

// Fonction AlphaBeta remaniée
function alphaBeta(depth, alpha, beta, node){
    if (gameOver || depth <= 0){
        //return currentIA === 'noir' ? {score: nbBlackPieces, move: null} : {score: nbWhitePieces, move: null};
        return currentIA === 'noir' ? nbBlackPieces : nbWhitePieces;
    }

    let initialState = JSON.parse(JSON.stringify(virtualBoard));
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves));
    let initialGameOver = gameOver;
    let initialPlayer = currentPlayer;

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

        //return {score: alpha, move: bestMove};
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

        //return {score: beta, move: bestMove};
        return beta;
    }
}

// Fonction alphabeta version NegaMax
function negAlphaBeta(depth, alpha, beta){
    if (gameOver || depth <= 0){
        //return currentIA === 'noir' ? {score: nbBlackPieces, move: null} : {score: nbWhitePieces, move: null};
        return currentIA === 'noir' ? nbBlackPieces : nbWhitePieces;
    }

    let initialState = JSON.parse(JSON.stringify(virtualBoard));
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves));
    let initialGameOver = gameOver;
    let initialPlayer = currentPlayer;

    let bestMove;  // Meilleur déplacement obtenu correspondant

    for (let m in initialPMoves) {
        if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
        let score = -negAlphaBeta(depth - 1, -beta, -alpha);
        console.log("score = " + score);
        unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer);

        if (score >= alpha) {
            alpha = score;
            bestMove = m;

            if (alpha >= beta) break;
        }
    }

    moveAI = bestMove;

    //return {score: alpha, move: bestMove};
    return alpha;
}


// ---------------------------------------------------------------------------------------------------------------
// Fonctions d'évaluation

// Evaluation par le nombre de pions
function evalNumberOfPieces(){
    return currentIA === 'noir' ? nbBlackPieces : nbWhitePieces;
}

// Evaluation par la mobilité
function evalMobility(){
    return lastPossibleMoves[lastMove].length;
}