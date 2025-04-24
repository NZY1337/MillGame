import { useState, useEffect } from "react";
import { Box, Typography, Divider, Grid, Container } from "@mui/material";
import "./App.css";

// www.youtube.com/watch?v=h3rvUfbPjTc

/* 

0----------1----------2
|          |          |
|  3-------4-------5  |
|  |       |       |  |
|  |   6---7---8   |  |
|  |   |   |   |   |  |
9 10--11-------12 13 14
|  |   |   |   |   |  |
|  |  15--16--17   |  |
|  |       |       |  |
| 18------19------20  |
|          |          |
21--------22---------23

*/

const mills = [
  // Horizontal Mills
  [0, 1, 2], // [X, X, X] || [O, O, O]
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],

  // Vertical Mills
  [0, 9, 21],
  [3, 10, 18],
  [6, 11, 15],
  [1, 4, 7],
  [16, 19, 22],
  [8, 12, 17],
  [5, 13, 20],
  [2, 14, 23],
];

const boardPoints = [
  { id: 0, x: 50, y: 50 },
  { id: 1, x: 250, y: 50 },
  { id: 2, x: 450, y: 50 },
  { id: 3, x: 125, y: 125 },
  { id: 4, x: 250, y: 125 },
  { id: 5, x: 375, y: 125 },
  { id: 6, x: 200, y: 200 },
  { id: 7, x: 250, y: 200 },
  { id: 8, x: 300, y: 200 },
  { id: 9, x: 50, y: 250 },
  { id: 10, x: 125, y: 250 },
  { id: 11, x: 200, y: 250 },
  { id: 12, x: 300, y: 250 },
  { id: 13, x: 375, y: 250 },
  { id: 14, x: 450, y: 250 },
  { id: 15, x: 200, y: 300 },
  { id: 16, x: 250, y: 300 },
  { id: 17, x: 300, y: 300 },
  { id: 18, x: 125, y: 375 },
  { id: 19, x: 250, y: 375 },
  { id: 20, x: 375, y: 375 },
  { id: 21, x: 50, y: 450 },
  { id: 22, x: 250, y: 450 },
  { id: 23, x: 450, y: 450 },
];

const adjacencyMap: Record<number, number[]> = {
  0: [1, 9],
  1: [0, 2, 4],
  2: [1, 14],
  3: [4, 10],
  4: [1, 3, 5, 7],
  5: [4, 13],
  6: [7, 11],
  7: [4, 6, 8],
  8: [7, 12],
  9: [0, 10, 21],
  10: [3, 9, 11, 18],
  11: [6, 10, 15],
  12: [8, 13, 17],
  13: [5, 12, 14, 20],
  14: [2, 13, 23],
  15: [11, 16],
  16: [15, 17, 19],
  17: [12, 16],
  18: [10, 19],
  19: [16, 18, 20, 22],
  20: [13, 19],
  21: [9, 22],
  22: [19, 21, 23],
  23: [14, 22],
};

type GamePhase = "placement" | "movement" | "removal" | "flying";
type Player = "X" | "O" ;

const movementPhase: (Player | null)[] = [
    "X",
    null,
    null,
    null,
    null,
    "O",
    null,
    null,
    "O",
    null,
    "X",
    null,
    null,
    "O",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "X",
    null,
    "O"
];
 
export default function Game() {
    const [moves, setMoves] = useState(Array(24).fill(null));
    // const [moves, setMoves] = useState<(Player | null)[]>(movementPhase);
    const [playerXMoves, setPlayerXMoves] = useState(0);
    const [playerOMoves, setPlayerOMoves] = useState(0);
    const [gamePhase, setGamePhase] = useState<GamePhase>("placement");
    const [previousGamePhase, setPreviousGamePhase] = useState<GamePhase | null>(null);
    const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
    const [currentRemover, setCurrentRemover] = useState<null | Player>(null);
    const [currentFlying, setCurrentFlying] = useState<{ X: boolean; O: boolean }>({ X: false, O: false });
    const removalOpponent = currentRemover === "O" ? "X" : "O";

    const isAdjacent = (from: number, to: number): boolean => {
        return adjacencyMap[from]?.includes(to);
    };

    const checkForMill = (index: number, player: Player | null, moves: (null | Player)[]) => {
        return mills.some((mill) => {
        const isInMill = mill.includes(index);
        const allMatch = mill.every((i) => moves[i] === player);
        return isInMill && allMatch;
        });
    };

    const updateGamePhase = (newPhase: GamePhase) => {
        setPreviousGamePhase(gamePhase); 
        setGamePhase(newPhase); 
    };


    const removePiece = (index: number) => {
        if (moves[index] === currentRemover) {
            const isInMill = checkForMill(index, currentRemover, moves);

            const opponentPieces = moves
                .map((v, i) => ({ v, i }))
                .filter(({ v }) => v === currentRemover);

            const allInMill = opponentPieces.every(({ i }) =>
                mills.some(
                (mill) =>
                    mill.includes(i) && mill.every((m) => moves[m] === currentRemover)
                )
            );
            
            if (!isInMill || allInMill) {
                const updatedMoves = [...moves];
                updatedMoves[index] = null;
                
                setMoves(updatedMoves);
                setCurrentRemover(null);

                if (previousGamePhase) {
                    updateGamePhase(previousGamePhase);
                }

                return;
            } else {
                alert("Nu poți elimina o piesă din moară dacă există alte opțiuni!");
                return;
            }
        }
    };
    
    const addPiece = (index: number) => {
        if (moves[index] !== null) return;
        
        const updatedMoves = [...moves];
        updatedMoves[index] = currentPlayer;

        currentPlayer === "X" ? setPlayerXMoves(move => move + 1) : setPlayerOMoves(move => move + 1);
        setMoves(updatedMoves);

        if (checkForMill(index, currentPlayer, updatedMoves)) {
            alert(`🟢 Jucătorul ${currentPlayer} a făcut o MOARĂ!`);

            // when in MILL - game phase :: removal
            updateGamePhase("removal");
            setCurrentRemover(currentPlayer === "X" ? "O" : "X");
        }

        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    };
    
    const movePiece = (index: number) => {
        if (selectedPieceIndex === null) {
            // First click  - select a piece to move
            if (moves[index] === currentPlayer) {
                setSelectedPieceIndex(index);
            } 

            if (moves[index] !== null && moves[index] !== currentPlayer) {
                alert("Not Your Piece! Choose your own piece.");
            } 

            return;
        }

        // Second click - attempt to move
        if (moves[index] !== null) {
            // You clicked on an occupied space, reset selection
            setSelectedPieceIndex(null);
            alert("Invalid move. Choose an empty point.");
            return;
        }

        // only for flying phase
        if (currentFlying[currentPlayer] === false) {
            const validMove = isAdjacent(selectedPieceIndex, index); // check if move is valid

            if (!validMove) {
                alert("Invalid move. Choose an adjacent point.");
                setSelectedPieceIndex(null);
                return;
            }
        }

        const updatedMoves = [...moves];
        updatedMoves[selectedPieceIndex] = null; // remove from old
        updatedMoves[index] = currentPlayer; // place on new

        setMoves(updatedMoves);
        setSelectedPieceIndex(null);

        const formedMill = checkForMill(index, currentPlayer, updatedMoves);

        if (formedMill) {
            setCurrentRemover(currentPlayer === "X" ? "O" : "X");
            setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
            
            updateGamePhase("removal");
            alert(`🟢 Jucătorul ${currentPlayer} a făcut o MOARĂ!`);
            return;
        }
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }

    const resetGame = () => {
        alert("Game Over! Resetting the game.");
        setMoves(Array(24).fill(null));
        setPlayerXMoves(0);
        setPlayerOMoves(0);
        setGamePhase("placement");
        setCurrentPlayer("X");
        setCurrentRemover(null);
        setCurrentFlying({ X: false, O: false });
        setSelectedPieceIndex(null);
        setPreviousGamePhase(null);
    }

    const determineGamePhase = (moves: (null | Player)[]) => {
        const playerCounts = moves.reduce(
            (counts, move) => {
                if (move === "X") counts.X++;
                if (move === "O") counts.O++;
                return counts;
            },
            { X: 0, O: 0 }
        );

        if (playerCounts.X === 2 && gamePhase === "flying") {
            resetGame();
        }

        if (playerCounts.O === 2 && gamePhase === "flying") {
            resetGame();
        }

        // flying
        if ((playerCounts.X === 3 || playerCounts.O === 3) && gamePhase === "movement") {
            setGamePhase("flying");
            setCurrentFlying({ X: playerCounts.X === 3, O: playerCounts.O === 3 });
            return;
        }

        if ((playerCounts.X === 3 || playerCounts.O === 3) && gamePhase === "flying") {
            setCurrentFlying({ X: playerCounts.X === 3, O: playerCounts.O === 3 });
            return;
        }
        
        // movement
        if (playerXMoves === 9 && playerOMoves === 9 && gamePhase === "placement") {
            setGamePhase("movement");
            return;
        }
    };

    const handleClick = (index: number) => {
        if (gamePhase == "removal") {
            removePiece(index);
        } else if (gamePhase == "placement") {
            addPiece(index);
        } else if (gamePhase == "movement" || gamePhase == "flying") {
            movePiece(index);
        } 
    };

    useEffect(() => {
        determineGamePhase(moves);
        console.log("useEffect triggered");
        console.log(moves)
    }, [playerOMoves, playerOMoves, moves]);

    return (
        <Grid container>
            <Grid size={{ xs: 12, lg: 10 }}>
                <svg viewBox="0 0 500 500" width="100%" height="95vh">
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow
                        dx="1"
                        dy="1"
                        stdDeviation="2"
                        floodColor="#000"
                        floodOpacity="0.4"
                    />
                    </filter>

                    <clipPath id="clip">
                    <rect x="0" y="0" width="500" height="500" rx="5" ry="5" />
                    </clipPath>
                </defs>

                <image
                    href="https://images.pexels.com/photos/4004374/pexels-photo-4004374.jpeg"
                    x="0"
                    y="0"
                    width="500"
                    height="500"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#clip)"
                />

                <rect
                    x="50"
                    y="50"
                    width="400"
                    height="400"
                    stroke="black"
                    fill="none"
                    strokeWidth="2"
                />
                <rect
                    x="125"
                    y="125"
                    width="250"
                    height="250"
                    stroke="black"
                    fill="none"
                    strokeWidth="2"
                />
                <rect
                    x="200"
                    y="200"
                    width="100"
                    height="100"
                    stroke="black"
                    fill="none"
                    strokeWidth="2"
                />

                <line
                    x1="250"
                    y1="50"
                    x2="250"
                    y2="200"
                    stroke="black"
                    strokeWidth="2"
                />
                
                <line
                    x1="250"
                    y1="300"
                    x2="250"
                    y2="450"
                    stroke="black"
                    strokeWidth="2"
                />
                <line
                    x1="50"
                    y1="250"
                    x2="200"
                    y2="250"
                    stroke="black"
                    strokeWidth="2"
                />
                <line
                    x1="300"
                    y1="250"
                    x2="450"
                    y2="250"
                    stroke="black"
                    strokeWidth="2"
                />

                {boardPoints.map(({ id, x, y }) => (
                    <g
                    key={id}
                    onClick={() => handleClick(id)}
                    style={{ cursor: "pointer" }}
                    >
                    <circle
                        cx={x}
                        cy={y}
                        r="15"
                        fill="#000"
                        stroke="#555"
                        strokeWidth="1"
                        textRendering={id}
                        filter="url(#shadow)"
                    />
                    {moves[id] && (
                        <>
                        <circle
                            cx={x}
                            cy={y}
                            r="11"
                            fill={moves[id] === "X" ? "#e63946" : "#1d3557"}
                            filter="url(#shadow)"
                            stroke={ 
                            selectedPieceIndex === id
                                ? "#fff"
                                : currentRemover === moves[id]
                                ? (() => {
                                    const isInMill = mills.some(
                                    (mill) =>
                                        mill.includes(id) &&
                                        mill.every((i) => moves[i] === moves[id])
                                    );

                                    const opponentPieces = moves
                                    .map((v, i) => ({ v, i }))
                                    .filter(({ v }) => v === moves[id]);

                                    const allInMill = opponentPieces.every(({ i }) =>
                                    mills.some(
                                        (mill) =>
                                        mill.includes(i) &&
                                        mill.every((m) => moves[m] === moves[id])
                                    )
                                    );

                                    return !isInMill || allInMill
                                    ? "yellow"
                                    : undefined;
                                })()
                                : undefined
                            }
                            strokeWidth="2"
                        />
                        <circle
                            cx={x - 3}
                            cy={y - 3}
                            r="3"
                            fill="white"
                            opacity="0.5"
                        />
                        </>
                    )}

                    {/* ID Label */}
                    {/* <text
                        x={x}
                        y={y + 4} // +4 centers the text vertically
                        textAnchor="middle"
                        fontSize="10"
                        opacity="0.1"
                        fill="white"
                    >
                        {id}
                    </text> */}
                    </g>
                ))}
                </svg>
            </Grid>
            <Grid
                size={{ xs: 12, lg: 2 }}
                sx={{
                    flex: 1,
                    bgcolor: "#2a2a2a",
                    borderRadius: "10px",
                    p: 3,
                    color: "#fff",
                }}
            >
                <Typography variant="h5" gutterBottom>
                🎮 Game Stats
                </Typography>

                <Divider sx={{ borderColor: "#555", my: 2 }} />

                <Grid container>
                    <Grid size={{ xs: 12, lg: 12 }}>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                        GamePhase: {gamePhase}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Typography variant="subtitle1" color="red">
                            🔴 Player X
                        </Typography>
                        <Typography variant="body2">
                            Pieces Placed: {playerXMoves} / 9
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Typography variant="subtitle1" color="skyblue">
                            🔵 Player O
                        </Typography>
                        <Typography variant="body2">
                            Pieces Placed: {playerOMoves} / 9
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: "#555", my: 3 }} />

                <Typography variant="body1">
                    <strong>Current Turn:</strong>{" "}
                    {currentPlayer === "X" ? "🔴 Player X" : "🔵 Player O"}
                </Typography>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    <em>
                        {currentRemover &&
                        `CurrentRemover: ${removalOpponent} needs to remove ${currentRemover}'s piece`}
                    </em>
                    <br />
                    CurrentPlayer: {currentPlayer}
                    <br />
                    removalOpponent: {removalOpponent}
                    <br />

                    CurrentRemover: {currentRemover}
                </Typography>

                {currentFlying.X && (
                    <Typography variant="body2" sx={{ mt: 2 }} color="red"> 
                        Player X can fly!
                    </Typography>
                )}
                {currentFlying.O && (
                    <Typography variant="body2" sx={{ mt: 2 }} color="blue"> 
                        Player O can fly!
                    </Typography>
                )}
            </Grid>
        </Grid>
    );
}
