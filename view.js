/*******************************************************
 * Fonctions relatives à la VUE (partie visuel du jeu) *
 *******************************************************/

// Initialisation du plateau HTML par rapport au règles d'Othello
function initBoardView() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        let $row = $('<tr></tr>').attr('id', "row" + i);

        for (let j = 0; j < BOARD_SIZE; j++) {
            let $cell = $('<td></td>').attr('id', 'row' + i + 'col' + j);
            let $butt = $('<button class="vide"></button>').attr('id', i + 'x' + j);

            $cell.append($butt);
            $row.append($cell);
        }

        $plateau.append($row);
    }

    toggleState('#row3col3', 'blanc');
    toggleState('#row3col4', 'noir');
    toggleState('#row4col3', 'noir');
    toggleState('#row4col4', 'blanc');

    $('#currentPlayer').text(currentPlayer);
}

// Change la couleur d'un pion HTML el par newState
function toggleState(el, newState) {
    $(el).find('button').removeClass();
    $(el).find('button').addClass(newState);
}

// Fonctions mettant à jour la vue (données du plateau + plateau lui-même)
function updateBoardView(){
    for (let i = 0; i < BOARD_SIZE; ++i){
        for (let j = 0; j < BOARD_SIZE; ++j){
            toggleState($('#row' + i + 'col' + j), virtualBoard[i][j]);
        }
    }

    $('#currentPlayer').text(currentPlayer);
    $('#timer').text(sec + " sec");
}

// Actualise le nombre de pions blanc et noir
function updateNbPiecesView(){
    $('#nbBlackPieces').text(nbBlackPieces);
    $('#nbWhitePieces').text(nbWhitePieces);
}