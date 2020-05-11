const BOARD_SIZE = 8,  // Dimension du plateau
    SEC_TIMER = 10;  // Temps initial du timer

let $plateau,                     // Element plateau
    gameMode,                     // Mode de jeu
    gameOver,                     // La partie est finie ?
    currentPlayer,                // Joueur courant (noir | blanc)
    possibleMoves,                // Ensemble des déplacements possibles
    sec,                          // Temps restant pour le tour actuel
    nbBlackPieces, nbWhitePieces, // Nombre de pions respectivement noirs et blancs
    timer,                        // Timer pour la rotation des tours
    timeout,
    playerCanClick;

// Variables concernant les IA
let virtualBoard,      // Plateau virtuel (graphe)
    difficulty,        // Niveau de difficulté des IA
    currentIA,         // IA en train de jouer (noir | blanc)
    openAI,
    moveAI,            // Meilleur déplacement possible pour l'IA en train de jouer
    lastPossibleMoves, // Contient la liste des coups précédents possibles pour heuristique mobilité
    lastMove;          // Dernier déplacement effectué par une IA


(function ($) {
    // Page chargée
    $(document).ready(() => {
        $plateau = $('table#plateau');
        gameOver = false;
        currentPlayer = 'noir';
        possibleMoves = {};
        sec = SEC_TIMER;
        nbBlackPieces = 2;
        nbWhitePieces = 2;

        // Gestion du formulaire de paramétrage
        $('input[name="mode"]').on('change', e => {
            let $divDif = $('#diff');
            if (e.target.value.includes("ia")) {
                $divDif.removeClass('hidden');
            } else {
                $divDif.addClass('hidden');
            }
        });

        // Appuie sur le bouton Jouer (Initialisations)
        $('#formstart').submit(event => {
            gameMode = $('input[name=mode]:checked').val();
            difficulty = $('input[name=difficulte]:checked').val();

            $('#welcomediv').addClass('hidden');
            $('#game').removeClass('hidden');

            initVirtualBoard();   // Initialisation du modèle
            initBoardView();      // Initialisation de la vue
            updateNbPiecesView(); // Mise à jour des nombres respectifs de pions
            initListeners();      // Initialisation des clics sur le plateau
            timer = initTimer();  // Initialisation du timer

            // Gestion des IA
            if (gameMode === 'jvsj') playerCanClick = true;
            else if (gameMode === 'jvsia') {
                currentIA = 'blanc';
                playerCanClick = true;
            } else {
                currentIA = 'noir';
                playerCanClick = false;

                timeout = setTimeout(() => {
                    //console.log("START IA");
                    AIPlay();
                }, 2000);
            }

            // Empeche la soummission du formulaire
            event.preventDefault();
        });

        // Initialisation du timer
        function initTimer(){
            return setInterval(() => {
                let $timer = $('#timer');
                sec--;
                $timer.text(sec + " sec");

                if (sec < 0) {
                    sec = SEC_TIMER;
                    $timer.text(sec + " sec");
                    swapPlayer(false);
                    $('#currentPlayer').text(currentPlayer);
                }
            }, 1000);
        }

// Initialisation des écouteurs (MODIFIER TOUT POUR AVOIR UN MODELE ET UNE VUE)
        function initListeners(){
            // Listener sur les cases
            $plateau.find('button').on('click', function () {

                // Fonction exécutée lors d'un click
                if (playerCanClick) executeClick($(this).attr('id'));
            });
        }
    });
})(jQuery);

// Difficultés
// 1. Implémentation des algos (fonctions makeMove et unmake à adapter)
// 2. Gestion des joueurs + données durant les calculs d'une IA

/* A Faire
- Bloquer les clicks quand une IA joue (désactiver complètement quand 2 IA jouent) OK
- IA de niveau débutant : déplacements aléatoires OK
- IA de niveau intermédiaire et expert (profondeur 1 et 3) OK
- Sélection d'un algorithme de recherche de stratégie gagnante (radio buttons + gestion des choix)
- Zone d'information en rapport avec les IA et algos utilisés
 */