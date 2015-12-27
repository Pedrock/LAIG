/**
 * LinearAnimation
 * @constructor
 */
function LinearAnimation(scene, timespan, controlPoints) {
	Animation.call(this, scene, timespan);
    this.controlPoints = controlPoints;
    this.numberSections = controlPoints.length-1;
    
	this.totalLength = 0;
	this.totalLengthPerSection = {};
	this.totalLengthPerSection[-1] = 0;
	for (var i = 0; i < this.numberSections; i++)
	{
		var p1 = this.controlPoints[i];
		var p2 = this.controlPoints[i+1];
		var length = Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2)+Math.pow(p1[2]-p2[2],2));
		this.totalLength += length;
		this.totalLengthPerSection[i] = this.totalLength;
	}
	this.normals = [];
	this.rotations = [];
    this.calculateNormalsAndRotations();
    this.currSections = {};
    this.positions = {};   
}

LinearAnimation.prototype = new Animation;

// Função que inicia a animação linear
LinearAnimation.prototype.start = function(node, startTime)
{
	Animation.prototype.start.call(this, node, startTime);
	this.currSections[node] = 0;
	this.positions[node] = this.controlPoints[0].slice();
}

// Função que calcula as direções e rotações para cada secção
LinearAnimation.prototype.calculateNormalsAndRotations = function()
{
	for (var section = 0; section < this.numberSections; section++)
	{
		var p1 = this.controlPoints[section];
		var p2 = this.controlPoints[section+1];
		var direction = [p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]];
		var N = Math.sqrt(direction[0]*direction[0]+direction[1]*direction[1]+direction[2]*direction[2]);
		if (N != 0) this.normals.push([direction[0]/N,direction[1]/N,direction[2]/N]);
		else this.normals.push([0,0,0]);
		if (this.normals[section][0] == 0 && this.normals[section][2] == 0 && section > 0)
			this.rotations.push(this.rotations[section-1]);
		else this.rotations.push(Math.atan2(-this.normals[section][2],this.normals[section][0]));
	}
}

// Função que calcula a posição atual
LinearAnimation.prototype.updatePosition = function(node, currLength)
{
	var section = this.currSections[node];
	var sectionLength = this.totalLengthPerSection[section]-this.totalLengthPerSection[section-1];
	var sectionPercentage = (currLength - this.totalLengthPerSection[section-1])/sectionLength;
	if (sectionLength == 0) sectionPercentage = 0;
	for (var coord = 0; coord <= 2; coord++)
	{
		this.positions[node][coord] = this.controlPoints[section][coord] + sectionPercentage*sectionLength*this.normals[section][coord];
	}
}

// Função que atualiza a animação
LinearAnimation.prototype.update = function(node, currTime){
    if(this.running[node]){
		if (!this.startTime[node])
		{
			this.startTime[node] = currTime;
			this.currSections[node] = 0;
			this.positions[node] = this.controlPoints[0].slice();
		}
        else
		{
			var currLength = (currTime-this.startTime[node])/(this.timespan*1000)*this.totalLength;
			var prevSection = this.currSections[node];
			while (currLength > this.totalLengthPerSection[this.currSections[node]] && this.currSections[node] <= this.numberSections)
			{
				this.currSections[node]++;
			}
			if (this.currSections[node] == this.numberSections)
			{
				this.positions[node] = this.controlPoints[this.currSections[node]];
				this.currSections[node]--;
				this.running[node] = false;
			}
			else
			{
				this.updatePosition(node,currLength);
			}
        }
    }
}

// Função que aplica as transformações da animação
LinearAnimation.prototype.apply = function(node) {
	if (this.positions[node])
	{
		this.scene.translate.apply(this.scene,this.positions[node]);
		this.scene.rotate(this.rotations[this.currSections[node]],0,1,0);
	}
	else
	{
		this.scene.translate.apply(this.scene,this.controlPoints[0]);
		this.scene.rotate(this.rotations[0],0,1,0);
	}
}