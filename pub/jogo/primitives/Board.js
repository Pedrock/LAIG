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
    
    this.center = [this.board[0].length, 0, this.board.length];
    
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
    
    this.gold = new CGFappearance(this.scene);
    this.gold.setAmbient(0.6, 0.4, 0, 1);
    this.gold.setDiffuse(0.6, 0.4, 0, 1);
    this.gold.setSpecular(1, 1, 1, 1);
    this.gold.setShininess(5);
    
    this.silver = new CGFappearance(this.scene);
    this.silver.setAmbient(0.375, 0.4, 0.4, 1);
    this.silver.setDiffuse(0.8, 0.85, 0.85, 1);
    this.silver.setSpecular(1, 1, 1, 1);
    this.silver.setShininess(10);

    this.capturedPieces = {1: [], 2: []};
    
    this.pieces = [];
    this.planes = [];
    this.createBoardPieces();
    
    this.moveAnimation = null;
    this.capturedAnimation = null;
    
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
}

Board.prototype.calculateSidePiecePosition = function(player, index)
{
    var side = player == 1 ? 1 : -1;
    var column = index % 2;
    var rowN = ~~(index/2)+1;
    var row = ((rowN % 2) ? 1 : -1) * ~~(rowN/2);
    return [side*this.cellWidth*(this.board.length/2+1+column)+this.board.length*this.cellWidth/2, this.cellWidth*row+this.board.length*this.cellWidth/2];
}

Board.prototype.capture = function(player, piece)
{
    if (piece)
    {
        var coords = this.calculateSidePiecePosition(player,this.capturedPieces[player].length);
        var delta = [coords[0]-piece.boardPosition[0]*this.cellWidth-this.cellWidth/2,coords[1]-piece.boardPosition[1]*this.cellWidth-this.cellWidth/2];
        var self = this;
        this.capturedAnimation = new CapturedAnimation(this.scene, player, piece, delta, function() {
             self.capturedPieces[player].push(piece);
             self.capturedAnimation = null;
        });
    }
}

Board.prototype.updateScore = function() 
{
    this.score[1] = this.capturedPieces[1].length;
    this.score[2] = this.capturedPieces[2].length;
}

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

Board.prototype.createPickHandler = function() 
{
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
                            
                            var self = this;
                            
                            var delta = [pos[0] - this.pickStart[0], pos[1] - this.pickStart[1]];
                            x = this.pickStart[0] + 1;
                            y = this.pickStart[1] + 1;
                            var handler = this.handleResponse.bind(this);
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
                    var object = new Escort(this.scene);
                    break;
                case 2:
                    var object = new Escort(this.scene);
                    break;
                case 4:
                    var object = new Flagship(this.scene);
                    break;
                }
                if (object !== undefined) 
                {
                    this.pieces[y][x] = object;
                    object.boardPosition = [x, y];
                } 
                else
                    console.warn("Invalid board");
            }
        }
    }
}

Board.prototype.computerPlay = function() 
{
    var handler = this.handleResponse.bind(this);
    Game.computerPlay(this.board, this.currentPlayer, this.difficulty[this.currentPlayer], this.playCounter, handler);
}

Board.prototype.handleResponse = function(valid, x, y, deltax, deltay, newCounter, newBoard) 
{
    if (valid) 
    {
        var player = this.currentPlayer;
        this.timeStart = null ;
        var nextPlayer = this.currentPlayer;
        if (newCounter == 2)
            nextPlayer = (nextPlayer == 1 ? 2 : 1);
        this.getValidMoves(newBoard, nextPlayer, newCounter % 2);
        this.playCounter = newCounter;
        var pickObject = this.pieces[y-1][x-1];
        var self = this;
        this.moveAnimation = new PieceAnimation(this.scene,pickObject,[this.cellWidth * deltax, this.cellWidth * deltay],function() 
        {
            self.board = newBoard;
            self.pieces[y-1][x-1] = null ;
            pos = [x - 1 + deltax, y - 1 + deltay];
            pickObject.boardPosition = pos;
            self.capture(player,self.pieces[pos[1]][pos[0]]);
            self.pieces[pos[1]][pos[0]] = pickObject;
            self.moveAnimation = null;
            self.pickStart = self.pickEnd = null ;
            if (self.playCounter == 2) 
            {
                self.updateScore();
                self.switchPlayer();
            }
        }
        );
    } 
    else
        this.pickStart = this.pickEnd = null ;
}

Board.prototype.update = function(currTime) 
{
    if (this.moveAnimation) 
    {
        this.moveAnimation.update(currTime);
    } 
    else 
    {
        if (!this.human[this.currentPlayer] && !this.pickStart) 
        {
            this.pickStart = true;
            this.computerPlay();
        }
        if (!this.timeStart) 
        {
            this.timeStart = currTime;
            this.timeLeft = this.timePerPlay;
        }
        this.timeLeft = Math.max(0, this.timeStart + this.timePerPlay - currTime);
        if (this.timeLeft == 0) 
        {
            this.timeStart = currTime;
            this.switchPlayer();
            this.getValidMoves();
        }
    }
    
    if (this.capturedAnimation)
    {
        this.capturedAnimation.update(currTime);
    }
}

Board.prototype.switchPlayer = function() 
{
    this.playCounter = 0;
    this.currentPlayer = (this.currentPlayer == 1 ? 2 : 1);
    this.pickStart = null ;
}

Board.prototype.display = function() 
{
    this.scene.pushMatrix();
    this.scene.scale(1 / this.board.length, 1 / this.board.length, 1 / this.board.length);
    this.scene.translate(-this.board.length*this.cellWidth/2, 0, -this.board.length*this.cellWidth/2);
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
            this.scene.scale(0.95*this.cellWidth, 1, 0.95*this.cellWidth);
            if (!this.moveAnimation && this.board[y][x] != 0 && this.board[y][x] % 2 == this.currentPlayer % 2 
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
                if (this.board[y][x] == 1)
                    this.silver.apply();
                else
                    this.gold.apply();
                this.scene.pushMatrix();
                this.scene.translate(this.cellWidth * x + this.cellWidth/2, 0, this.cellWidth * y + this.cellWidth/2);
                if (this.moveAnimation && this.moveAnimation.object === piece) 
                {
                    this.moveAnimation.apply();
                }
                this.scene.registerForPick(1 + y * this.board.length + x, this.plane);
                this.scene.scale(0.25, 0.25, 0.25);
                piece.display();
                this.scene.popMatrix();
            }
        }
    }
    if (this.capturedAnimation)
    {
        this.scene.pushMatrix();
        coords = this.capturedAnimation.object.boardPosition;
        coords = [this.cellWidth*coords[0],this.cellWidth*coords[1]];
        this.capturedAnimation.apply();
        this.scene.translate(coords[0]+this.cellWidth/2,0,coords[1]+this.cellWidth/2);
        this.scene.scale(0.25, 0.25, 0.25);
        (this.capturedAnimation.player == 1 ? this.gold : this.silver).apply();
        this.capturedAnimation.object.display();
        this.scene.popMatrix();
    }
    for (var player = 1; player <= 2; player++)
    {
        for (var i = 0; i < this.capturedPieces[player].length; i++)
        {
            (player == 1 ? this.gold : this.silver).apply();
            var coords = this.calculateSidePiecePosition(player, i);
            this.scene.pushMatrix();
                this.scene.translate(coords[0],0,coords[1]);
                this.scene.scale(0.25, 0.25, 0.25);
                this.capturedPieces[player][i].display();
            this.scene.popMatrix();
        }
    }
    this.scene.popMatrix();
}
