/**
 * Animation
 * @constructor
 */
function Animation(scene, timespan) {
    this.scene = scene;
    this.timespan = timespan;
    this.running = {};
	this.startTime = {};
}


//Função que inicia a animação
Animation.prototype.start = function(node, startTime){
	if (startTime) this.startTime[node] = startTime;
	else this.startTime[node] = null;
	this.running[node] = true;
}