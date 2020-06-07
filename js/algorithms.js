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
    if (gameOver || depth === 0) {
        return heuristique();
    }

    // Enregistre l'état actuel du jeu à chaque étape de l'algorithme afin d'affectuer plus tard le retour arrière
    let initialState = JSON.parse(JSON.stringify(virtualBoard));   // Sauvegarde de l'état actuel du plateau (avant déplacement)
    let initialPMoves = JSON.parse(JSON.stringify(possibleMoves)); // Sauvegarde des déplacements possibles
    let initialGameOver = gameOver;                                // Sauvegarde de l'état du jeu (si le jeu est fini ou non)
    let initialPlayer = currentPlayer;                             // Sauvegarde du joueur courant
    let initialMove = lastMove;                                    // Sauvegarde du dernier déplacement
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestScore; // Meilleur score obtenu (nombre de pions)
    let bestMove;  // Meilleur déplacement obtenu correspondant

    if (node === 'MAX'){
        bestScore = -Infinity;

        for (let m in initialPMoves){
            // Exécution du déplacement
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            // Récupération du score
            let score = minimax(depth - 1, 'MIN');
            // Annulation du déplacement
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer, initialMove);

            // Comparaison du score obtenu avec le meilleur score
            if (score > bestScore){
                bestScore = score;
                bestMove = m;
            }
        }
    } else {
        bestScore = Infinity;

        for (let m in initialPMoves) {
            // Exécution du déplacement
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            // Récupération du score
            let score = minimax(depth - 1, 'MAX');
            // Annulation du déplacement
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer, initialMove);

            // Comparaison du score obtenu avec le meilleur score
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
    let initialMove = lastMove;
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestMove;  // Meilleur déplacement obtenu correspondant

    if (node === 'MAX'){
        for (let m in initialPMoves){
            // Exécution du déplacement
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            // Récupération du score
            let score = alphaBeta(depth - 1, alpha, beta, 'MIN');
            // Annulation du déplacement
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer, initialMove);

            // Comparaison du score obtenu avec le meilleur score
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
            // Exécution du déplacement
            if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
            // Récupération du score
            let score = alphaBeta(depth - 1, alpha, beta, 'MAX');
            // Annulation du déplacement
            unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer, initialMove);

            // Comparaison du score obtenu avec le meilleur score
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
    let initialMove = lastMove;
    lastPossibleMoves = JSON.parse(JSON.stringify(initialPMoves));

    let bestMove;  // Meilleur déplacement obtenu correspondant

    for (let m in initialPMoves) {
        // Exécution du déplacement
        if (initialPMoves.hasOwnProperty(m)) makeMove(m, true);
        // Récupération du score
        let score = -negAlphaBeta(depth - 1, -beta, -alpha);
        // Annulation du déplacement
        unmakeMove(initialState, initialPMoves, initialGameOver, initialPlayer, initialMove);

        // Comparaison du score obtenu avec le meilleur score
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

// Initialisation du tableau de valeur de positions
// Les valeurs ont été prises sur Internet
function initPositionValues(){
                     //  0     1    2   3   4   5    6     7
    positionValues = [[ 500, -150, 30, 10, 10, 30, -150,  500],  // 0
                      [-150, -250,  0,  0,  0,  0, -250, -150],  // 1
                      [  30,    0,  1,  2,  2,  1,    0,   30],  // 2
                      [  10,    0,  2, 16, 16,  2,    0,   10],  // 3
                      [  10,    0,  2, 16, 16,  2,    0,   10],  // 4
                      [  30,    0,  1,  2,  2,  1,    0,   30],  // 5
                      [-150, -250,  0,  0,  0,  0, -250, -150],  // 6
                      [ 500, -150, 30, 10, 10, 30, -150,  500]]; // 7
}

// Gestion des fonctions d'évaluation pour les différents modes de jeu
// Deux IA peuvent utiliser un heuristique différent de l'autre
function heuristique(){
    if (gameMode === 'jvsia'){
        if (heuristique1 === 'nbpion') return evalNumberOfPieces();
        else if (heuristique1 === 'mobi') return evalMobility();
        else if (heuristique1 === 'valpos') return evalPositionValue();
    } else {
        if (currentIA === 'noir'){
            if (heuristique1 === 'nbpion') return evalNumberOfPieces();
            else if (heuristique1 === 'mobi') return evalMobility();
            else if (heuristique1 === 'valpos') return evalPositionValue();
        } else {
            if (heuristique2 === 'nbpion') return evalNumberOfPieces();
            else if (heuristique2 === 'mobi') return evalMobility();
            else if (heuristique2 === 'valpos') return evalPositionValue();
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

// Evaluation par la valeur de la position
function evalPositionValue(){
    let coords = lastMove.split('x');
    return positionValues[coords[0]][coords[1]];
}