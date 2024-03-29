/**
 * Construtor de tabuleiro
 */
function Board(scene) 
{
    CGFobject.call(this, scene);
    this.scene = scene;
    
    this.board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 1, 0, 0, 2, 2, 2, 0, 0, 1, 0], 
    [0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 0], 
    [0, 1, 0, 2, 0, 4, 0, 2, 0, 1, 0], 
    [0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 0], 
    [0, 1, 0, 0, 2, 2, 2, 0, 0, 1, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    this.cellWidth = 2;
    
    this.defaultMaterial = new CGFappearance(this.scene);
    this.defaultMaterial.setAmbient(0.6, 0.6, 0.8, 1);
    this.defaultMaterial.setDiffuse(0.6, 0.6, 0.8, 1);
    this.defaultMaterial.setSpecular(0, 0, 1, 1);
    this.defaultMaterial.setShininess(200);
    
    this.selectionMaterial = new CGFappearance(this.scene);
    this.selectionMaterial.setAmbient(0.6, 0.8, 0.6, 1);
    this.selectionMaterial.setDiffuse(0.6, 0.8, 0.6, 1);
    this.selectionMaterial.setSpecular(0, 0, 1, 1);
    this.selectionMaterial.setShininess(200);
    
    this.choiceMaterial = new CGFappearance(this.scene);
    this.choiceMaterial.setAmbient(0.8, 0.6, 0.6, 1);
    this.choiceMaterial.setDiffuse(0.8, 0.6, 0.6, 1);
    this.choiceMaterial.setSpecular(0, 0, 1, 1);
    this.choiceMaterial.setShininess(200);
    
    this.capturedPieces = {
        1: [],
        2: []
    };
    
    this.pieces = [];
    this.planes = [];

    this.createBoardPieces();
    
    this.moveAnimation = null ;
    this.capturedAnimation = null ;
    
    this.pickStart = null ;
    this.pickEnd = null ;
    
    this.currentPlayer = 1;
    this.playCounter = 0;
    
    this.timePerPlay = 15000;
    this.timeStart;
    this.timeLeft = this.timePerPlay;
    
    this.plane = new Plane(this.scene,5);
    
    this.getValidMoves(this.board, this.currentPlayer, this.playCounter);
    
    this.human = {
        1: true,
        2: true
    };
    this.difficulty = {
        1: 0,
        2: 0
    };
    
    this.score = {
        1: 0,
        2: 0
    }

    this.winner = 0;
    
    this.movesStack = [];
}

// Obter posição de peça lateral de acordo com o indice da mesma e o jogador que a capturou
Board.prototype.calculateSidePiecePosition = function(player, index) 
{
    var side = player == 1 ? 1 : -1;
    var column = index % 2;
    var rowN = ~~(index / 2) + 1;
    var row = ((rowN % 2) ? 1 : -1) * ~~(rowN / 2);
    if (row == -5 && column == 1) 
    {
        row = 5;
        column = 0;
    }
    return [side * this.cellWidth * (this.board.length / 2 + 1 + column) + this.board.length * this.cellWidth / 2, this.cellWidth * row + this.board.length * this.cellWidth / 2];
}

// Verifica se uma peça vai ser capturada e se for o caso, realiza a animação de captura
Board.prototype.capture = function(player, piece, pos) 
{
    if (piece) 
    {
        var coords = this.calculateSidePiecePosition(player, this.capturedPieces[player].length);
        var delta = [coords[0] - piece.boardPosition[0] * this.cellWidth - this.cellWidth / 2, coords[1] - piece.boardPosition[1] * this.cellWidth - this.cellWidth / 2];
        var self = this;
        this.moveAnimation.endCaptureHandler = function(reversed) {
            if (!reversed) 
            {
                self.capturedPieces[player].push(piece);
            } 
            else
                self.pieces[pos[1]][pos[0]] = piece;
            self.capturedAnimation = null ;
        }
        ;
        this.capturedAnimation = new CapturedAnimation(this.scene,player,piece,delta,this.moveAnimation);
    }
    else
        this.moveAnimation.captureFinished(false);
}

// Atualiza a pontuação
Board.prototype.updateScore = function() 
{
    this.score[1] = this.capturedPieces[1].length;
    this.score[2] = this.capturedPieces[2].length;
}

// Obter jogadas válidas
Board.prototype.getValidMoves = function(board, player, playCounter) 
{
    board = (board === undefined ? this.board : board);
    player = (player === undefined ? this.currentPlayer : player);
    playCounter = (playCounter === undefined ? this.playCounter : playCounter);
    this.validMoves = {};
    var self = this;
    Game.getValidMoves(board, player, playCounter, function(moves) 
    {
        self.validMoves = moves;
    });
}

// Handler do picking
Board.prototype.createPickHandler = function() 
{
    if (!this.started || this.winner) return;
    if (this.scene.pickMode == false) {
        if (this.scene.pickResults != null  && this.scene.pickResults.length > 0) {
            for (var i = 0; i < this.scene.pickResults.length; i++) {
                var obj = this.scene.pickResults[i][0];
                if (obj) 
                {
                    if (this.moveAnimation === null  && this.human[this.currentPlayer]) 
                    {
                        var customId = this.scene.pickResults[i][1] - 1;
                        var pos = [customId % this.board[0].length, ~~(customId / this.board.length)];
                        var object = this.pieces[pos[1]][pos[0]];
                        if (this.pickStart) 
                        {
                            console.log("Picked second");
                            this.pickEnd = pos;
                            var delta = [pos[0] - this.pickStart[0], pos[1] - this.pickStart[1]];
                            x = this.pickStart[0] + 1;
                            y = this.pickStart[1] + 1;
                            var handler = this.handleResponse.bind(this);
                            this.awaitingResponse = true;
                            Game.play(this.board, this.currentPlayer, x, y, delta[0], delta[1], this.playCounter, handler);
                        } 
                        else if (object && this.board[pos[1]][pos[0]] % 2 == this.currentPlayer % 2) 
                        {
                            console.log("Picked first");
                            this.pickStart = pos;
                        } 
                        else 
                        {
                            console.log("Invalid first pick");
                        }
                    }
                    console.log("Picked object: " + obj + ", with pick id " + customId, ", position: " + pos);
                }
            }
            this.scene.pickResults.splice(0, this.scene.pickResults.length);
        }
    }
}

// Altera as peças a serem usadas aquando da troca de cena
Board.prototype.updateBoardPieces = function(flagship, gold_escort, silver_escort)
{
    this.flagship = flagship;
    this.gold_escort = gold_escort;
    this.silver_escort = silver_escort;
}

// Cria as peças de tabuleiro de acordo com a matriz do tabuleiro
Board.prototype.createBoardPieces = function() 
{
    for (var y = 0; y < this.board.length; y++) 
    {
        this.pieces[y] = [];
        for (var x = 0; x < this.board[y].length; x++) 
        {
            if (this.board[y][x] != 0) 
            {
                switch (this.board[y][x]) 
                {
                case 1: 
                    var object = 'silver_escort';
                    break;
                case 2:
                    var object = 'gold_escort';
                    break;
                case 4:
                    var object = 'flagship';
                    break;
                }
                if (object !== undefined) 
                {
                    this.pieces[y][x] = {object: object};
                    this.pieces[y][x].boardPosition = [x, y];
                } 
                else
                    console.warn("Invalid board");
            }
        }
    }
}

// Realiza jogada do computador
Board.prototype.computerPlay = function() 
{
    var handler = this.handleResponse.bind(this);
    this.awaitingResponse = true;
    Game.computerPlay(this.board, this.currentPlayer, this.difficulty[this.currentPlayer], this.playCounter, handler);
}

// Handler de respostas de jogadas
Board.prototype.handleResponse = function(valid, x, y, deltax, deltay, newCounter, newBoard, winner) 
{
    if (!this.awaitingResponse) return;
    this.awaitingResponse = false;
    if (valid) 
    {
        var player = this.currentPlayer;
        this.timeStart = null ;
        var nextPlayer = this.currentPlayer;
        if (newCounter == 2)
            nextPlayer = (nextPlayer == 1 ? 2 : 1);
        var pickObject = this.pieces[y - 1][x - 1];
        pos = [x - 1 + deltax, y - 1 + deltay];
        var capturedPiece = this.pieces[pos[1]][pos[0]];
        var self = this;
        this.moveAnimation = new PieceAnimation(this.scene,pickObject,[this.cellWidth * deltax, this.cellWidth * deltay],function() 
        {
            if (!self.moveAnimation.reversed) 
            {
                var move = {
                    x: x,
                    y: y,
                    deltax: deltax,
                    deltay: deltay,
                    board: self.board,
                    newBoard: newBoard,
                    playCounter: self.playCounter,
                    newCounter: newCounter,
                    player: self.currentPlayer
                };
                self.movesStack.push(move);
                if (self.currentPlayer == player) 
                {
                    self.getValidMoves(newBoard, nextPlayer, newCounter % 2);
                    self.playCounter = newCounter;
                }
                self.board = newBoard;
                self.pieces[y - 1][x - 1] = null;
                pickObject.boardPosition = pos;
                self.pieces[pos[1]][pos[0]] = pickObject;
                if (!winner && self.playCounter == 2) 
                {
                    self.updateScore();
                    self.switchPlayer();
                }
                self.winner = winner;
            }
            self.moveAnimation = null ;
            self.pickStart = self.pickEnd = null ;
        }
        ,
        function() 
        {
            self.pieces[pos[1]][pos[0]] = null ;
            self.capture(player, capturedPiece, pos);
        }
        );
    } 
    else
        this.pickStart = this.pickEnd = null ;
}

// Iniciar o jogo
Board.prototype.start = function()
{
    this.started = true;
}

// Função de update
Board.prototype.update = function(currTime) 
{
    if (!this.started) return;
    if (this.moveAnimation && this.moveAnimation) 
    {
        this.moveAnimation.update(currTime);
    }
    else if (this.reverse_all)
    {
        if (this.movesStack.length) this.undo_last_move(true,currTime);
        else this.reverse_all = false;
    }
    else if (this.replay_active)
    {
       if (this.replayStack.length)
       {
            var move = this.replayStack.shift();
            this.currentPlayer = move.player;
            this.board = move.board;
            this.awaitingResponse = true;
            this.handleResponse(true,move.x,move.y,move.deltax,move.deltay,move.newCounter,move.newBoard);
            this.moveAnimation.update(currTime);
       }
       else this.replay_active = false;
    }

    if (!this.moveAnimation && !this.winner) 
    {
        if (!this.human[this.currentPlayer] && !this.awaitingResponse && this.started && !this.replay_active && !this.reverse_all) 
        {
            this.computerPlay();
        }
        if (!this.timeStart) 
        {
            this.timeStart = currTime;
            this.timeLeft = this.timePerPlay;
        }
        this.timeLeft = Math.max(0, this.timeStart + this.timePerPlay - currTime);
        if (this.timeLeft === 0 && !this.awaitingResponse) 
        {
            this.switchPlayer();
            this.timeStart = currTime;
            this.getValidMoves();
        }
    }
    if (this.capturedAnimation) 
    {
        this.capturedAnimation.update(currTime);
    }
}

// Trocar de jogador
Board.prototype.switchPlayer = function() 
{
    this.timeStart = null;
    this.playCounter = 0;
    this.currentPlayer = (this.currentPlayer == 1 ? 2 : 1);
    this.pickStart = null ;
}

// Desfazer última jogada
Board.prototype.undo_last_move = function(fast, currTime)
{
    var self = this;
    var move = this.movesStack.pop();
    if (move.board[move.y - 1 + move.deltay][move.x - 1 + move.deltax] != 0) 
    {
        var capturePiece = this.capturedPieces[move.player][this.capturedPieces[move.player].length - 1];
        capturePiece.boardPosition = [move.x - 1 + move.deltax, move.y - 1 + move.deltay];
        var coords = this.calculateSidePiecePosition(move.player, this.capturedPieces[move.player].length - 1);
        var pos = [move.x - 1 + move.deltax, move.y - 1 + move.deltay];
        var delta = [coords[0] - pos[0] * this.cellWidth - this.cellWidth / 2, coords[1] - pos[1] * this.cellWidth - this.cellWidth / 2];
        var captureHandler = function() 
        {
            self.capturedAnimation = new CapturedAnimation(self.scene,move.player,capturePiece,delta,self.moveAnimation,true,fast);
            self.capturedPieces[move.player].pop();
        }
        ;
    }
    ;
    var piece = this.pieces[move.y - 1 + move.deltay][move.x - 1 + move.deltax];
    self.currentPlayer = move.player;
    self.playCounter = move.playCounter;
    self.board = move.board;
    self.pieces[move.y - 1][move.x - 1] = piece;
    self.pieces[piece.boardPosition[1]][piece.boardPosition[0]] = null ;
    piece.boardPosition = [move.x - 1, move.y - 1];
    this.moveAnimation = new PieceAnimation(this.scene,piece,[this.cellWidth * move.deltax, this.cellWidth * move.deltay],function() 
    {
        self.getValidMoves(move.board, move.player, move.playCounter);
        self.updateScore();
        self.moveAnimation = null;
        self.pickStart = self.pickEnd = null ;
        self.timeStart = null ;
        self.winner = 0;
        if (capturePiece)
            self.pieces[pos[1]][pos[0]] = capturePiece;
    }
    ,captureHandler,true,fast);
    if (!capturePiece)
        this.moveAnimation.captureFinished(false);
    this.moveAnimation.endCaptureHandler = function(reversed) {
        self.capturedAnimation = null ;
    }
    ;
    if (this.moveAnimation && currTime) this.moveAnimation.update(currTime);
}

// Pedir para desfazer a ultima jogada
Board.prototype.undo = function() 
{
    if (this.replay_active) return;
    this.awaitingResponse = false;
    if (this.moveAnimation) 
    {
        this.moveAnimation.reverse();
        if (this.capturedAnimation)
            this.capturedAnimation.reverse();
    } 
    else if (this.movesStack.length) 
    {
        this.undo_last_move(false);
    }
}

// Pedir para fazer replay
Board.prototype.replay = function() 
{
    if (!this.replay_active && !this.reverse_all && this.movesStack.length)
    {
        this.awaitingResponse = false;
        this.replayStack = this.movesStack.slice();
        this.replay_active = true;
        this.reverse_all = true;
    }
}

// Pedir para reeniciar o jogo
Board.prototype.restart = function() 
{
    if (!this.replay_active && !this.reverse_all && this.movesStack.length)
    {
        this.awaitingResponse = false;
        this.replayStack = this.movesStack.slice();
        this.reverse_all = true;
    }
}

// Display do tabuleiro
Board.prototype.display = function() 
{
    this.scene.pushMatrix();
    this.scene.scale(1 / this.board.length, 1 / this.board.length, 1 / this.board.length);
    this.scene.translate(-this.board.length * this.cellWidth / 2, 0, -this.board.length * this.cellWidth / 2);
    this.scene.clearPickRegistration();
    this.createPickHandler();
    var i = 0;
    for (var y = 0; y < this.board.length; y++) 
    {
        for (var x = 0; x < this.board[y].length; x++) 
        {
            this.scene.registerForPick(++i, this.plane);
            this.scene.pushMatrix();
            this.scene.translate(this.cellWidth * x + 1, 0, this.cellWidth * y + 1);
            this.scene.scale(0.95 * this.cellWidth, 1, 0.95 * this.cellWidth);
            if (!this.winner && !this.replay_active && !this.reverse_all && !this.moveAnimation && this.board[y][x] != 0 && this.board[y][x] % 2 == this.currentPlayer % 2 
            && (!this.pickStart || (this.pickStart[0] == x && this.pickStart[1] == y))) 
            {
                this.selectionMaterial.apply();
            } 
            else if (!this.moveAnimation && this.pickStart && this.validMoves[this.pickStart] && this.validMoves[this.pickStart][[x, y]]) 
            {
                this.choiceMaterial.apply();
            } 
            else
                this.defaultMaterial.apply();
            this.plane.display();
            this.scene.popMatrix();
            var piece = this.pieces[y][x];
            if (piece) 
            {
                this.scene.pushMatrix();
                this.scene.translate(this.cellWidth * x + this.cellWidth / 2, 0, this.cellWidth * y + this.cellWidth / 2);
                if (this.moveAnimation && this.moveAnimation.started && this.moveAnimation.object === piece) 
                {
                    this.moveAnimation.apply();
                }
                this.scene.registerForPick(1 + y * this.board.length + x, this.plane);
                this.scene.scale(0.25, 0.25, 0.25);
                this[piece.object].display();
                this.scene.popMatrix();
            }
        }
    }
    if (this.capturedAnimation) 
    {
        this.scene.pushMatrix();
        coords = this.capturedAnimation.object.boardPosition;
        coords = [this.cellWidth * coords[0], this.cellWidth * coords[1]];
        this.capturedAnimation.apply();
        this.scene.translate(coords[0] + this.cellWidth / 2, 0, coords[1] + this.cellWidth / 2);
        this.scene.scale(0.25, 0.25, 0.25);
        this[this.capturedAnimation.object.object].display();
        this.scene.popMatrix();
    }
    for (var player = 1; player <= 2; player++) 
    {
        for (var i = 0; i < this.capturedPieces[player].length; i++) 
        {
            var coords = this.calculateSidePiecePosition(player, i);
            this.scene.pushMatrix();
            this.scene.translate(coords[0], 0, coords[1]);
            this.scene.scale(0.25, 0.25, 0.25);
            this[this.capturedPieces[player][i].object].display();
            this.scene.popMatrix();
        }
    }
    this.scene.popMatrix();
}
