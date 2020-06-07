// Constantes
const BOARD_SIZE = 8,  // Dimension du plateau
    SEC_TIMER = 20;    // Temps initial du timer

// Variables globales
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
    positionValues,    // Tableau de valeurs des positions (heuristique)
    difficulty,        // Niveau de difficulté des IA
    algorithm1,        // Algorithme utilisé pour l'IA 1
    algorithm2,        // Algorithme utilisé pour l'IA 2
    heuristique1,      // Heuristique utilisé pour l'IA 1
    heuristique2,      // Heuristique utilisé pour l'IA 2
    currentIA,         // IA en train de jouer (noir | blanc)
    openAI,
    moveAI,            // Meilleur déplacement possible pour l'IA en train de jouer
    lastPossibleMoves, // Contient la liste des coups précédents possibles pour heuristique mobilité
    lastMove;          // Dernier déplacement effectué par une IA


(function ($) {
    // Fonction exécutée lorsque la page est chargée
    $(document).ready(() => {
        // Initialisation des variables de départ
        $plateau = $('table#plateau');
        gameOver = false;
        currentPlayer = 'noir';
        possibleMoves = {};
        sec = SEC_TIMER;
        nbBlackPieces = 2;
        nbWhitePieces = 2;

        // Gestion des modes de jeu
        // En fonction du mode de jeu choisi, le formulaire change pour afficher les choix correspondant aux modes
        $('input[name="mode"]').on('change', e => {
            let $diff = $('#diff');
            let $algojvsia = $('#algojvsia');
            let $algoiavsia = $('#algoiavsia');

            // Si le mode de jeu est Joueur contre IA, on affiche le choix de difficulté
            if (e.target.value === 'jvsia') {
                $diff.removeClass('hidden');
                // Si la difficulté est autre chose que facile, on affiche les paramètres de l'IA
                if ($('input[name=difficulte]:checked').val() !== 'easy') {
                    $algojvsia.removeClass('hidden');
                    $algoiavsia.addClass('hidden');
                } else $algojvsia.addClass('hidden');
            // Sinon si le mode de jeu est IA contre IA, on affiche le choix de difficulté
            } else if(e.target.value === 'iavsia') {
                $diff.removeClass('hidden');
                // Si la difficulté est autre chose que facile, on affiche les paramètres des IA
                if ($('input[name=difficulte]:checked').val() !== 'easy') {
                    $algoiavsia.removeClass('hidden');
                    $algojvsia.addClass('hidden');
                } else $algoiavsia.addClass('hidden');
            // Sinon on n'affiche pas les difficultés ni le paramétrage d'IA
            } else {
                $diff.addClass('hidden');
                $algoiavsia.addClass('hidden');
                $algojvsia.addClass('hidden');
            }
        });

        // Gestion des difficultés
        // De même ici en fonction de la difficulté choisie, le formulaire change pour afficher les choix correspondants
        $('input[name="difficulte"]').on('change', e => {
            let $algojvsia = $('#algojvsia');
            let $algoiavsia = $('#algoiavsia');
            let $mode = $('input[name="mode"]:checked');

            // Si la difficulté choisie est autre chose que facile
            if (!e.target.value.includes("easy")){
                // Si le mode de jeu est Joueur contre IA
                if ($mode.val() === 'jvsia') {
                    $algojvsia.removeClass('hidden');
                    $algoiavsia.addClass('hidden');
                // Sinon si le mode de jeu est IA contre IA
                } else if ($mode.val() === 'iavsia') {
                    $algoiavsia.removeClass('hidden');
                    $algojvsia.addClass('hidden');
                } else {
                    $algojvsia.addClass('hidden');
                    $algoiavsia.addClass('hidden');
                }
            } else {
                $algojvsia.addClass('hidden');
                $algoiavsia.addClass('hidden');
            }
        });

        // Appuie sur le bouton Jouer
        // On initialise les variables restantes, utiles pour la suite comme le mode de jeu, la difficulté, les algos, etc
        $('#formstart').submit(event => {
            gameMode = $('input[name=mode]:checked').val();
            difficulty = $('input[name=difficulte]:checked').val();

            // Si le mode de jeu est Joueur contre IA
            if (!$('#algojvsia').hasClass('hidden')) {
                algorithm1 = $('input[name="algorithme"]:checked').val();
                heuristique1 = $('input[name="heuristique"]:checked').val();
            // Sinon si le mode de jeu est IA contre IA
            } else if (!$('#algoiavsia').hasClass('hidden')) {
                algorithm1 = $('input[name="algorithmeia1"]:checked').val();
                heuristique1 = $('input[name="heuristiqueia1"]:checked').val();
                algorithm2 = $('input[name="algorithmeia2"]:checked').val();
                heuristique2 = $('input[name="heuristiqueia2"]:checked').val();
            }

            $('#welcomediv').addClass('hidden');
            $('#game').removeClass('hidden');

            // Si un heuristique de valeur de positions est utilisé, on initialise le tableau des valeurs du plateau
            if (heuristique1 === 'valpos' || heuristique2 === 'valpos') initPositionValues();

            initVirtualBoard();   // Initialisation du modèle
            initBoardView();      // Initialisation de la vue
            updateNbPiecesView(); // Mise à jour des nombres respectifs de pions
            initListeners();      // Initialisation des clics sur le plateau
            timer = initTimer();  // Initialisation du timer

            // Gestion des IA
            // Si le mode de jeu est Joueur contre Joueur, on doit pouvoir cliquer directement
            if (gameMode === 'jvsj') playerCanClick = true;
            // Sinon si le mode de jeu est Joueur contre IA, on sait que l'IA est BLANC et le joueur doit pouvoir cliquer directement
            else if (gameMode === 'jvsia') {
                currentIA = 'blanc';
                playerCanClick = true;
            // Sinon on définit l'IA courante comme étant NOIRE, on empêche l'utilisateur de cliquer et on démarre l'IA
            } else {
                currentIA = 'noir';
                playerCanClick = false;

                // On démarre l'IA après 2 secondes pour une meilleure visualisation
                timeout = setTimeout(() => {
                    AIPlay();
                }, 2000);
            }

            // Empeche la soummission du formulaire (raffraichissement de la page)
            event.preventDefault();
        });

        // Initialisation du timer actualisé toute les secondes
        function initTimer(){
            return setInterval(() => {
                let $timer = $('#timer');
                sec--;
                $timer.text(sec + " sec");

                // Si le temps est écoulé, on change de joueur
                if (sec < 0) {
                    sec = SEC_TIMER;
                    $timer.text(sec + " sec");
                    swapPlayer(false);
                    $('#currentPlayer').text(currentPlayer);
                }
            }, 1000);
        }

        // Initialisation des écouteurs des cases du plateau
        function initListeners(){
            // Listener sur les cases
            $plateau.find('button').on('click', function () {
                // Fonction exécutée lors d'un click
                if (playerCanClick) executeClick($(this).attr('id'));
            });
        }
    });
})(jQuery);