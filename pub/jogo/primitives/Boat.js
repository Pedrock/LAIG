function Boat(scene) {
	CGFobject.call(this,scene);

//Superficies de cima do corpo do boat
	this.supFront = new Patch(this.scene, 3, 20, 20, [
       [-2,0,0],[-2.33,0.5,0],[-2.66,1,0],[-3,1.5,0],
       [-1,0,1],[-1.33,0.5,1.33],[-1.66,1,1.66],[-2,1.5,2],
       [1,0,1],[1.33,0.5,1.33],[1.66,1,1.66],[2,1.5,2],
       [2,0,0],[2.33,0.5,0],[2.66,1,0],[3,1.5,0]
	]);

	this.supFrontInside = new Patch(this.scene, 3, 20, 20, [
        [2,1,0],[2.33,1.15,0],[2.66,1.3,0],[3,1.5,0],
        [1,1,1],[1.33,1.15,1.33],[1.66,1.3,1.66],[2,1.5,2],
        [-1,1,1],[-1.33,1.15,1.33],[-1.66,1.3,1.66],[-2,1.5,2],
        [-2,1,0],[-2.33,1.15,0],[-2.66,1.3,0],[-3,1.5,0]       
	]);

	this.supBack = new Patch(this.scene, 3, 20, 20, [
        [2,0,0],[2.33,0.5,0],[2.66,1,0],[3,1.5,0],
        [1,0,-1],[1.33,0.5,-1.33],[1.66,1,-1.66],[2,1.5,-2],
        [-1,0,-1],[-1.33,0.5,-1.33],[-1.66,1,-1.66],[-2,1.5,-2],
        [-2,0,0],[-2.33,0.5,0],[-2.66,1,0],[-3,1.5,0]  
	]);

	this.supBackInside = new Patch(this.scene, 3, 20, 20, [
		[-2,1,0],[-2.33,1.15,0],[-2.66,1.3,0],[-3,1.5,0],
		[-1,1,-1],[-1.33,1.15,-1.33],[-1.66,1.3,-1.66],[-2,1.5,-2],
		[1,1,-1],[1.33,1.15,-1.33],[1.66,1.3,-1.66],[2,1.5,-2],
		[2,1,0],[2.33,1.15,0],[2.66,1.3,0],[3,1.5,0]        
	]);

	this.supDown = new Patch(this.scene, 3, 20, 20, [
        [-2,0,0],[-2,0,0],[-2,0,0],[-2,0,0],
        [-1,0,-1],[-1,0,-0.5],[-1,0,0.5],[-1,0,1],  
        [1,0,-1],[1,0,-0.5],[1,0,0.5],[1,0,1], 
        [2,0,0],[2,0,0],[2,0,0],[2,0,0]
	]);

	this.supDownInside = new Patch(this.scene, 3, 20, 20, [
        [2,1,0],[2,1,0],[2,1,0],[2,1,0],
        [1,1,-1],[1,1,-0.5],[1,1,0.5],[1,1,1],  
        [-1,1,-1],[-1,1,-0.5],[-1,1,0.5],[-1,1,1], 
        [-2,1,0],[-2,1,0],[-2,1,0],[-2,1,0]
	]);

};

Boat.prototype = Object.create(CGFobject.prototype);
Boat.prototype.constructor=Boat;


Boat.prototype.display = function() {
		this.scene.pushMatrix();
			this.supFront.display();
			this.supFrontInside.display();
			this.supBack.display();
			this.supBackInside.display();
			this.supDown.display();
			this.supDownInside.display();
		this.scene.popMatrix();
}