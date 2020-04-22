;(function ($) {
	const BOARD_SIZE = 8,
		SEC_TIMER = 10

	let $plateau, // Element plateau
		gameMode, // Mode de jeu
		gameOver, // La partie est finie ?
		currentPlayer, // Joueur courant (noir | blanc)
		possibleMoves, // Ensemble des déplacements possibles
		sec, // Temps restant pour le tour actuel
		nbBlackPieces,
		nbWhitePieces, // Nombre de pions respectivement noirs et blancs
		timer, // Timer pour la rotation des tours
		timeout,
		playerCanClick

	let virtualBoard, // Plateau virtuel (graphe)
		difficulty, // Niveau de difficulté des IA
		currentIA, // IA en train de jouer (noir | blanc)
		openAI

	// Page chargée
	$(document).ready(() => {
		$plateau = $('table#plateau')
		gameOver = false
		currentPlayer = 'noir'
		possibleMoves = {}
		sec = SEC_TIMER

		// Gestion du formulaire de paramétrage
		$('input[name="mode"]').on('change', e => {
			let $divDif = $('#diff')
			if (e.target.value.includes('ia')) {
				$divDif.removeClass('hidden')
			} else {
				$divDif.addClass('hidden')
			}
		})

		// Appuie sur le bouton Jouer (Initialisations)
		$('#formstart').submit(event => {
			gameMode = $('input[name=mode]:checked').val()
			difficulty = $('input[name=difficulte]:checked').val()

			$('#welcomediv').addClass('hidden')
			$('#game').removeClass('hidden')

			initVirtualBoard() // Initialisation du modèle
			initBoardView() // Initialisation de la vue
			updateNbPiecesView() // Mise à jour des nombres respectifs de pions
			initListeners() // Initialisation des clics sur le plateau
			timer = initTimer() // Initialisation du timer

			// Gestion des IA
			if (gameMode === 'jvsj') playerCanClick = true
			else if (gameMode === 'jvsia') {
				currentIA = 'blanc'
				playerCanClick = true
			} else {
				currentIA = 'noir'
				playerCanClick = false

				timeout = setTimeout(() => {
					//console.log("START IA");
					AIPlay()
				}, 2000)
			}

			// Empeche la soummission du formulaire
			event.preventDefault()
		})
	})

	// Initialisation du timer
	function initTimer() {
		return setInterval(() => {
			$('#timer').text(sec + ' sec')
			sec--

			if (sec < 0) {
				sec = SEC_TIMER
				swapPlayer(false)
				$('#currentPlayer').text(currentPlayer)
			}
		}, 1000)
	}

	// Initialisation des écouteurs (MODIFIER TOUT POUR AVOIR UN MODELE ET UNE VUE)
	function initListeners() {
		// Listener sur les cases
		$plateau.find('button').on('click', function () {
			// Fonction exécutée lors d'un click
			if (playerCanClick) executeClick($(this).attr('id'))
		})
	}

	// -----------------------------------------------------------------------------------------------------------------

	/*************************************************************
	 * Fonctions relatives au MODEL (partie mathématique du jeu) *
	 *************************************************************/

	// Initialisation du plateau
	function initVirtualBoard() {
		// Création
		virtualBoard = new Array(BOARD_SIZE)
		for (let i = 0; i < virtualBoard.length; ++i) {
			virtualBoard[i] = new Array(BOARD_SIZE)
		}

		// Initialisation par rapport à la situation actuelle du jeu
		for (let i = 0; i < BOARD_SIZE; ++i) {
			for (let j = 0; j < BOARD_SIZE; ++j) {
				virtualBoard[i][j] = 'vide'
			}
		}

		virtualBoard[3][3] = 'blanc'
		virtualBoard[3][4] = 'noir'
		virtualBoard[4][3] = 'noir'
		virtualBoard[4][4] = 'blanc'

		possibleMoves = getPossibleMoves()
	}

	// Vérifie que les coordonnées sont dans le plateau
	function isInBoard(x, y) {
		return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE
	}

	// Modifie le joueur virtuel courant  ( A FAIRE : REVOIR LE CHANGEMENT DE JOUEUR AVEC IA QUAND IA GAGNE)
	function swapPlayer(isIA) {
		currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir'
		possibleMoves = getPossibleMoves()

		// Si le joueur ne peut pas jouer et que l'autre peut continuer de jouer, on passe à l'autre
		if ($.isEmptyObject(possibleMoves)) {
			currentPlayer = currentPlayer === 'noir' ? 'blanc' : 'noir'
			possibleMoves = getPossibleMoves()
		}

		if (!isIA && gameMode === 'iavsia') currentIA = currentPlayer

		// Gestion des IAs
		if (!isIA && gameMode !== 'jvsj') {
			if (gameMode === 'jvsia') {
				if (currentPlayer === 'blanc') {
					openAI = true
					playerCanClick = false
				} else {
					playerCanClick = true
				}
			}
			//if (gameMode === 'jvsia' && currentPlayer === 'blanc') openAI = true;
			else if (gameMode === 'iavsia') openAI = true
		}

		// Si le joueur est une IA
		if (openAI) {
			timeout = setTimeout(function () {
				//console.log("START IA");
				AIPlay()
			}, 2000)
		}
	}

	// MAJ du nombre de pièces
	function updateNbPieces() {
		nbBlackPieces = 0
		nbWhitePieces = 0

		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				if (virtualBoard[row][col] === 'noir') nbBlackPieces++
				else if (virtualBoard[row][col] === 'blanc') nbWhitePieces++
			}
		}
	}

	// Vérifie que des pions ennemis sont à proximité
	function isCloseEnemyPiece(row, col) {
		let enemy = currentPlayer === 'blanc' ? 'noir' : 'blanc'

		return (
			(isInBoard(row - 1, col) && virtualBoard[row - 1][col] === enemy) ||
			(isInBoard(row - 1, col - 1) &&
				virtualBoard[row - 1][col - 1] === enemy) ||
			(isInBoard(row, col - 1) && virtualBoard[row][col - 1] === enemy) ||
			(isInBoard(row + 1, col - 1) &&
				virtualBoard[row + 1][col - 1] === enemy) ||
			(isInBoard(row + 1, col) && virtualBoard[row + 1][col] === enemy) ||
			(isInBoard(row + 1, col + 1) &&
				virtualBoard[row + 1][col + 1] === enemy) ||
			(isInBoard(row, col + 1) && virtualBoard[row][col + 1] === enemy) ||
			(isInBoard(row - 1, col + 1) &&
				virtualBoard[row - 1][col + 1] === enemy)
		)
	}

	// Retourne l'ensemble des déplacements possibles pour le joueur courant
	function getPossibleMoves() {
		let moves = {}

		for (let row = 0; row < BOARD_SIZE; row++) {
			for (let col = 0; col < BOARD_SIZE; col++) {
				// On regarde si la position est propice à la pose d'un pion
				if (
					virtualBoard[row][col] === 'vide' &&
					isCloseEnemyPiece(row, col)
				) {
					let coords = []
					let temp

					// Recherche des pions à gauche
					if (col > 1) {
						temp = []
						for (let y = col - 1; y >= 0; y--) {
							if (virtualBoard[row][y] === 'vide') break
							else if (
								virtualBoard[row][y] === currentPlayer &&
								y === col - 1
							)
								break
							else if (virtualBoard[row][y] === currentPlayer) {
								coords.push.apply(coords, temp)
								break
							} else temp.push({ row: row, col: y })
						}
					}

					// Recherche des pions à droite
					if (col < BOARD_SIZE - 1) {
						temp = []
						for (let y = col + 1; y < BOARD_SIZE; y++) {
							if (virtualBoard[row][y] === 'vide') break
							else if (
								virtualBoard[row][y] === currentPlayer &&
								y === col + 1
							)
								break
							else if (virtualBoard[row][y] === currentPlayer) {
								coords.push.apply(coords, temp)
								break
							} else temp.push({ row: row, col: y })
						}
					}

					// Recherche des pions en haut
					if (row > 1) {
						temp = []
						for (let x = row - 1; x >= 0; x--) {
							if (virtualBoard[x][col] === 'vide') break
							else if (
								virtualBoard[x][col] === currentPlayer &&
								x === row - 1
							)
								break
							else if (virtualBoard[x][col] === currentPlayer) {
								coords.push.apply(coords, temp)
								break
							} else temp.push({ row: x, col: col })
						}
					}

					// Recherche des pions en bas
					if (row < BOARD_SIZE - 1) {
						temp = []
						for (let x = row + 1; x < BOARD_SIZE; x++) {
							if (virtualBoard[x][col] === 'vide') break
							else if (
								virtualBoard[x][col] === currentPlayer &&
								x === row + 1
							)
								break
							else if (virtualBoard[x][col] === currentPlayer) {
								coords.push.apply(coords, temp)
								break
							} else temp.push({ row: x, col: col })
						}
					}

					// Recherche des pions en haut à gauche
					if (row > 1 && col > 1) {
						let y = col - 1
						temp = []
						for (let x = row - 1; x >= 0; x--) {
							if (y >= 0) {
								if (virtualBoard[x][y] === 'vide') break
								else if (
									virtualBoard[x][y] === currentPlayer &&
									x === row - 1 &&
									y === col - 1
								)
									break
								else if (virtualBoard[x][y] === currentPlayer) {
									coords.push.apply(coords, temp)
									break
								} else temp.push({ row: x, col: y })
								--y
							} else break
						}
					}

					// Recherche des pions en bas à gauche
					if (row < BOARD_SIZE - 1 && col > 1) {
						let y = col - 1
						temp = []
						for (let x = row + 1; x < BOARD_SIZE; x++) {
							if (y >= 0) {
								if (virtualBoard[x][y] === 'vide') break
								else if (
									virtualBoard[x][y] === currentPlayer &&
									x === row + 1 &&
									y === col - 1
								)
									break
								else if (virtualBoard[x][y] === currentPlayer) {
									coords.push.apply(coords, temp)
									break
								} else temp.push({ row: x, col: y })
								--y
							} else break
						}
					}

					// Recherche des pions en haut à droite
					if (row > 1 && col < BOARD_SIZE - 1) {
						let y = col + 1
						temp = []
						for (let x = row - 1; x >= 0; x--) {
							if (y < BOARD_SIZE) {
								if (virtualBoard[x][y] === 'vide') break
								else if (
									virtualBoard[x][y] === currentPlayer &&
									x === row - 1 &&
									y === col + 1
								)
									break
								else if (virtualBoard[x][y] === currentPlayer) {
									coords.push.apply(coords, temp)
									break
								} else temp.push({ row: x, col: y })
								++y
							} else break
						}
					}

					// Recherche des pions en bas à droite
					if (row < BOARD_SIZE - 1 && col < BOARD_SIZE - 1) {
						let y = col + 1
						temp = []
						for (let x = row + 1; x < BOARD_SIZE; x++) {
							if (y < BOARD_SIZE) {
								if (virtualBoard[x][y] === 'vide') break
								else if (
									virtualBoard[x][y] === currentPlayer &&
									x === row + 1 &&
									y === col + 1
								)
									break
								else if (virtualBoard[x][y] === currentPlayer) {
									coords.push.apply(coords, temp)
									break
								} else temp.push({ row: x, col: y })
								++y
							} else break
						}
					}

					// Ajout de la position et de la liste de coordonnées
					if (coords.length > 0) moves[row + 'x' + col] = coords
				}
			}
		}

		return moves
	}

	// Effectue un déplacement
	function makeMove(moveKey, isIA) {
		let coords = moveKey.split('x')

		for (let i = 0; i < possibleMoves[moveKey].length; i++) {
			virtualBoard[possibleMoves[moveKey][i].row][
				possibleMoves[moveKey][i].col
			] = currentPlayer
		}

		// Ajout du pion sur la case cliquée
		virtualBoard[coords[0]][coords[1]] = currentPlayer

		// MAJ du nombre de pièces
		updateNbPieces()

		if (gameIsOver()) gameOver = true

		swapPlayer(isIA)
	}

	// Retourne à un état du plateau
	function unmakeMove(state, moves, over, player) {
		virtualBoard = JSON.parse(JSON.stringify(state)) // Deep copy
		possibleMoves = JSON.parse(JSON.stringify(moves)) // Deep copy
		gameOver = over
		currentPlayer = player
		updateNbPieces()
	}

	// Retourne si la partie doit se finir
	function gameIsOver() {
		return (
			nbBlackPieces === 0 ||
			nbWhitePieces === 0 ||
			nbWhitePieces + nbBlackPieces === 64
		)
	}

	// Met fin au jeu
	function endGame() {
		clearInterval(timer)
		$('#timer').text('-- sec')
		alert(
			'Partie terminée, le gagnant est le joueur ' +
				(nbWhitePieces > nbBlackPieces ? 'blanc' : 'noir')
		)
	}

	// Fonction appelée lors d'un click
	function executeClick(id) {
		if (id in possibleMoves) {
			// Application du déplacement
			makeMove(id, false)

			// MAJ de la vue
			updateBoardView()
			updateNbPiecesView()

			// Vérification de la fin de partie
			if (gameOver) endGame()

			sec = SEC_TIMER
		}
	}

	// Action d'une IA
	function AIPlay() {
		//console.log("AI");
		clearTimeout(timeout)
		timeout = null

		// Gère l'accès à cette même méthode
		openAI = false

		// Application d'algorithme de recherche en fonction de la difficulté
		let result
		if (difficulty === 'easy') {
			result = randomMove()
		} else if (difficulty === 'medium') {
			result = minimax(1, 'MAX')
		} else {
			result = minimax(3, 'MAX')
		}

		// Exécution d'un click correspondant au déplacement obtenu
		executeClick(result.move)
	}

	// -----------------------------------------------------------------------------------------------------------------

	/*******************************************************
	 * Fonctions relatives à la VUE (partie visuel du jeu) *
	 *******************************************************/

	// Initialisation du plateau HTML
	function initBoardView() {
		for (let i = 0; i < BOARD_SIZE; i++) {
			let $row = $('<tr></tr>').attr('id', 'row' + i)

			for (let j = 0; j < BOARD_SIZE; j++) {
				let $cell = $('<td></td>').attr('id', 'row' + i + 'col' + j)
				let $butt = $('<button class="vide"></button>').attr(
					'id',
					i + 'x' + j
				)

				$cell.append($butt)
				$row.append($cell)
			}

			$plateau.append($row)
		}

		toggleState('#row3col3', 'blanc')
		toggleState('#row3col4', 'noir')
		toggleState('#row4col3', 'noir')
		toggleState('#row4col4', 'blanc')

		$('#currentPlayer').text(currentPlayer)
	}

	// Change la couleur d'un pion HTML
	function toggleState(el, newState) {
		$(el).find('button').removeClass()
		$(el).find('button').addClass(newState)
	}

	// Fonctions mettant à jour la vue
	function updateBoardView() {
		for (let i = 0; i < BOARD_SIZE; ++i) {
			for (let j = 0; j < BOARD_SIZE; ++j) {
				toggleState($('#row' + i + 'col' + j), virtualBoard[i][j])
			}
		}

		$('#currentPlayer').text(currentPlayer)
	}

	// Actualise le nombre de pions blancs et noirs du graphe
	function updateNbPiecesView() {
		$('#nbBlackPieces').text(nbBlackPieces)
		$('#nbWhitePieces').text(nbWhitePieces)
	}

	// -----------------------------------------------------------------------------------------------------------------

	/***************************************************
	 * Fonctions de recherche de la meilleure solution *
	 ***************************************************/

	// ALGORITHMES DE RECHERCHES DE SOLUTIONS GAGNANTES
	// Les algorithmes implémentés sont ceux étudiés en cours de Théorie des Jeux

	// Fonction de recherche de solution pour une IA niveau débutante (position aléatoire)
	function randomMove() {
		let random = Math.floor(
			Math.random() * Object.keys(possibleMoves).length
		)
		return { move: Object.keys(possibleMoves)[random] }
	}

	// Fonction minimax remaniée
	function minimax(depth, node) {
		if (gameOver || depth === 0) {
			return currentIA === 'noir'
				? { score: nbBlackPieces, move: null }
				: { score: nbWhitePieces, move: null }
		}

		let initialState = JSON.parse(JSON.stringify(virtualBoard)),
			initialPMoves = JSON.parse(JSON.stringify(possibleMoves)),
			initialGameOver = gameOver,
			initialPlayer = currentPlayer

		let bestScore, // Meilleur score obtenu (nombre de pions)
			bestMove // Meilleur déplacement obtenu correspondant

		if (node === 'MAX') {
			bestScore = -Infinity

			for (let m in initialPMoves) {
				if (initialPMoves.hasOwnProperty(m)) makeMove(m, true)
				let res = minimax(depth - 1, 'MIN')
				unmakeMove(
					initialState,
					initialPMoves,
					initialGameOver,
					initialPlayer
				)

				if (res.score > bestScore) {
					bestScore = res.score
					bestMove = m
				}
			}
		} else {
			bestScore = Infinity

			for (let m in initialPMoves) {
				if (initialPMoves.hasOwnProperty(m)) makeMove(m, true)
				let res = minimax(depth - 1, 'MAX')
				unmakeMove(
					initialState,
					initialPMoves,
					initialGameOver,
					initialPlayer
				)

				if (res.score < bestScore) {
					bestScore = res.score
					bestMove = m
				}
			}
		}

		return { score: bestScore, move: bestMove }
	}
})(jQuery)

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
