 /**
 * InfoBoard
 *
 * Construtor do Marcador de jogo
 */
function InfoBoard(scene,board) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.board = board;

    this.charWidth = 0.002;
    this.rectangle = new Rectangle(scene,[0,this.charWidth],[this.charWidth,0],[this.charWidth,this.charWidth]);
    this.back = new Rectangle(scene,[0,this.charWidth*1.1],[this.charWidth*1.1,0],[1.1*this.charWidth,1.1*this.charWidth]);
	
	this.winnerRect = new Rectangle(scene,[0,this.charWidth*2],[this.charWidth*12,0],[this.charWidth*12,2*this.charWidth]);

    this.appearance = new CGFappearance(this.scene);
	this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
	this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);	
	this.appearance.setShininess(120);
    this.fontTexture = new CGFtexture(this.scene, "textures/text-atlas.png");
    this.appearance.setTexture(this.fontTexture);

	this.goldWins = new CGFappearance(this.scene);
	this.goldWins.setAmbient(1, 1, 1, 1);
    this.goldWins.loadTexture("textures/gold-wins.jpg");

    this.silverWins = new CGFappearance(this.scene);
    this.silverWins.setAmbient(1, 1, 1, 1);
    this.silverWins.loadTexture("textures/silver-wins.jpg");

    this.timeBackMaterial = new CGFappearance(this.scene);
	this.timeBackMaterial.setAmbient(0.3, 0.3, 0.3, 1);

	this.gold = new CGFappearance(this.scene);
	this.gold.setAmbient(1, 0.85, 0, 1);

	this.silver = new CGFappearance(this.scene);
	this.silver.setAmbient(1, 1, 1, 1);
}
;

InfoBoard.prototype = Object.create(CGFobject.prototype);
InfoBoard.prototype.constructor = InfoBoard;

// Função ease out exponencial
function easeOutExpo(t) {
	return -Math.pow( 2, -10 * t ) + 1;
};

// Função update
InfoBoard.prototype.update = function(currTime)
{
	if (!this.startTime && this.board.winner) this.startTime = currTime;

	var t = (currTime - this.startTime)/1000;
	if (this.startTime && !this.board.winner) this.startTime = null;
	this.winnerX = -6*this.charWidth*easeOutExpo(t);
}

// Display do marcador
InfoBoard.prototype.display = function()
{
    var frustum = this.scene.graph.initials.frustum;
    if (frustum)
    {
    	this.timeBackMaterial.apply();
		this.scene.translate(0,9.0*this.charWidth,-frustum.near)
    	if (this.board.winner && this.startTime)
    	{
			this.scene.pushMatrix();
				this.scene.translate(this.winnerX,-0.005,0);
				(this.board.winner == 2 ? this.goldWins : this.silverWins).apply();
				this.winnerRect.display();
			this.scene.popMatrix();
    	}
    	this.scene.translate(0,0,-0.00001);
		this.scene.pushMatrix();
			this.scene.translate(-3.5*this.charWidth,0,0);
			var seconds = ~~(this.board.timeLeft/1000);
			var milis = this.board.timeLeft % 1000; 
			this.displayString(("0"+seconds).slice(-2)+":"+(milis+"0").slice(0,2));
		this.scene.popMatrix();
		
		this.timeBackMaterial.apply();
		this.silver.apply();
        this.scene.pushMatrix();
			this.scene.translate(-6.5*this.charWidth,0,0);
			this.displayString(("0"+this.board.score[1]).slice(-2));
        this.scene.popMatrix();

		this.gold.apply();
        this.scene.pushMatrix();
			this.scene.translate(2.5*this.charWidth,0,0);
			this.displayString(("0"+this.board.score[2]).slice(-2));
        this.scene.popMatrix();
    }
}

// Escrever string
InfoBoard.prototype.displayString = function(str)
{
    this.scene.pushMatrix();
    this.scene.translate(-this.charWidth/20,-this.charWidth/20,-0.00001);
    for (var i = 0, len = str.length; i < len; i++) {
        this.scene.translate(this.charWidth,0,0);
        this.scene.pushMatrix();
            this.back.display();
        this.scene.popMatrix();
    }
    this.scene.popMatrix();

    this.scene.setActiveShaderSimple(this.scene.textShader);
    for (var i = 0, len = str.length; i < len; i++) {
        this.appearance.apply();
        var coords = getcharCoords(str[i]);
        this.scene.activeShader.setUniformsValues({'charCoords': coords});
        this.scene.translate(this.charWidth,0,0);
        this.rectangle.display();
    }
    this.scene.setActiveShaderSimple(this.scene.defaultShader);
}

// Obter coordenadas de determinado caracter
function getcharCoords(char)
{
    if (char >= "0" && char<= "9") return [char - "0",0];
    if (char == ":") return [0,1];
    return null;
}