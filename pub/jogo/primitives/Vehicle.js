function Vehicle(scene) {
	CGFobject.call(this,scene);

	this.helicopterBody = new HelicopterBody(this.scene);
};

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;


Vehicle.prototype.display = function() {

	this.helicopterBody.display();
 
}


