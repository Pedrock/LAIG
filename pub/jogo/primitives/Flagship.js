function Flagship(scene, fleet) {
	CGFobject.call(this,scene);

	this.fleet = fleet;

    this.cylinderMast = new Cylinder(this.scene, 8, 0.5, 0.5, 1, 40);
    this.boat = new Boat(this.scene);
    this.sphereMast = new Sphere(this.scene, 1, 40, 40);

    this.bigFrontSailing = new Patch(this.scene, 3, 20, 20, [
       [0,0,0],[0,0.5,0],[0,1,0],[0,1.5,0],
       [0.5,0,0.75],[0.5,0.5,0.75],[0.5,1,0.75],[0.5,1.5,0.75],
       [1,0,-0.75],[1,0.5,-0.75],[1,1,-0.75],[1,1.5,-0.75],
       [2,0.75,0],[2,0.75,0],[2,0.75,0],[2,0.75,0]
	]);

	this.bigBackSailing = new Patch(this.scene, 3, 20, 20, [
       [2,0.75,0],[2,0.75,0],[2,0.75,0],[2,0.75,0],
       [1,0,-0.75],[1,0.5,-0.75],[1,1,-0.75],[1,1.5,-0.75],
       [0.5,0,0.75],[0.5,0.5,0.75],[0.5,1,0.75],[0.5,1.5,0.75],
       [0,0,0],[0,0.5,0],[0,1,0],[0,1.5,0]
       ]);

       this.smallFrontSailing = new Patch(this.scene, 3, 20, 20, [
       [0,0,0],[0,0.5,0],[0,1,0],[0,1.5,0],
       [1,0,-0.75],[1,0.5,-0.75],[1,1,-0.75],[1,1.5,-0.75],
       [0.5,0,0.75],[0.5,0.5,0.75],[0.5,1,0.75],[0.5,1.5,0.75],
       [2,0.75,0],[2,0.75,0],[2,0.75,0],[2,0.75,0]
	]);

	this.smallBackSailing = new Patch(this.scene, 3, 20, 20, [
       [2,0.75,0],[2,0.75,0],[2,0.75,0],[2,0.75,0],
	   [0.5,0,0.75],[0.5,0.5,0.75],[0.5,1,0.75],[0.5,1.5,0.75],
	   [1,0,-0.75],[1,0.5,-0.75],[1,1,-0.75],[1,1.5,-0.75],
       [0,0,0],[0,0.5,0],[0,1,0],[0,1.5,0]
       ]);

	this.metal = new CGFappearance(this.scene);
	this.metal.setAmbient(0.95,0.95,0.95,1);
	this.metal.setDiffuse(0.85,0.85,0.85,1);
	this.metal.setSpecular(0.3,0.3,0.3,1); 
	this.metal.setShininess(200); 

	

};

Flagship.prototype = Object.create(CGFobject.prototype);
Flagship.prototype.constructor=Flagship;


Flagship.prototype.display = function() {
		this.scene.pushMatrix();
			this.scene.scale(1.5, 2, 1.5);
			this.boat.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(1.1, 2, 1.1);
			this.scene.rotate(-90*Math.PI/180.0, 1, 0, 0);
			this.scene.scale(0.5*0.9, 0.5*0.9, 0.6);
			this.cylinderMast.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(1.1, 2, 1.1);
		    this.scene.translate(0, 4.8, 0);
			this.scene.scale(0.25*0.9, 0, 0.25*0.9);
			this.sphereMast.display();
		this.scene.popMatrix();
		
		this.metal.apply();
		this.scene.pushMatrix();
            this.scene.translate(-0.2, -1, 0);
			this.scene.scale(2, 1.7, 3);
            this.scene.translate(0.2, 2.55, 0);
			this.scene.scale(2, 1.5, 1.5);
			this.bigBackSailing.display();
			this.bigFrontSailing.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
            this.scene.translate(0, 4.75, 0);
            this.scene.translate(0.2, 2.55, 0);
			this.scene.scale(2, 1.5, 1.5);
			this.smallFrontSailing.display();
			this.smallBackSailing.display();
		this.scene.popMatrix();

       
}