const socket = io(); // Assumes socket.io is already imported
const chess = new Chess(); // Assumes the Chess.js library is imported
const boardElement = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null; // Ensure this is set based on your application logic
const renderBoard = () => {
    const board = chess.board(); // Get the board array from Chess.js
    boardElement.innerHTML = ""; // Clear the current board
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            // If there's a piece on the square, render it
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", ""); // Required for drag events
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            // Enable drop on the square
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault(); // Necessary to allow drop
            });

            squareElement.addEventListener("drop", (e) => {
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row, 10),
                        col: parseInt(squareElement.dataset.col, 10),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement); 
        });
    });
    if (playerRole === "b") {
        boardElement.classList.add("flipped");
    }
    
    else{
        boardElement.classList.remove("remove");
    }
};



const handleMove = (source, target) => {
    const move ={
        from : `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to : `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion : 'q'
    };
    socket.emit("move",move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        K: "♔",
        Q: "♕",
        R: "♖",
        B: "♗",
        N: "♘",
        P: "♙",
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "♟︎",
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard();
});
socket.on("spectatorRole",function(){
    playerRole = null;
    renderBoard();
});
socket.on("boardState",function(fen){
   chess.load(fen);
    renderBoard();
});
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();
