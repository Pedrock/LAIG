/**
 * CircularAnimation
 * @constructor
 */
function CircularAnimation(scene, timespan, center, radius, inicialAngle, rotationAngle) {
    Animation.call(this, scene, timespan);
    this.center = center;
    this.radius = radius;
    this.inicialAngle = inicialAngle*Math.PI/180+Math.PI/2;
    this.rotationAngle = rotationAngle*Math.PI/180;
    this.rotations = {};
    this.direction = (rotationAngle<0?1:0)*Math.PI;
}

CircularAnimation.prototype = new Animation;

// Função que inicia a animação circular
CircularAnimation.prototype.start = function(node, startTime)
{
	Animation.prototype.start.call(this, node, startTime);
	this.rotations[node] = 0;
}

// Função que atualiza a animação
CircularAnimation.prototype.update = function(node, currTime) 
{
    if(this.running[node]){
		if (this.startTime[node] === null)
		{
			this.startTime[node] = currTime;
		}
        else
		{
			var currRotation = (currTime-this.startTime[node])/(this.timespan*1000)*this.rotationAngle;
			if (Math.abs(currRotation) >= Math.abs(this.rotationAngle)){
			   this.rotations[node] = this.rotationAngle;
			   this.running[node] = false; 
			}
			else this.rotations[node] = currRotation;
        }
    }
}


// Função que aplica as transformações da animação
CircularAnimation.prototype.apply = function(node) {
	var angle = this.inicialAngle;
	if (this.rotations[node]) angle+= this.rotations[node];
	this.scene.translate.apply(this.scene,this.center);
	this.scene.translate(this.radius*Math.sin(angle),0,this.radius*Math.cos(angle));
	this.scene.rotate(angle+this.direction,0,1,0);
}

