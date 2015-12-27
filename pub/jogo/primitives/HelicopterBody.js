function HelicopterBody(scene) {
	CGFobject.call(this,scene);

	this.supUPfront = new Patch(this.scene, 3, 20, 20, [
       [5,0,-2],[5,3.5,-1.95],[5,3.5,1.95],[5,0,2],
       [5,0,-2],[5,3.5,-1.95],[5,3.5,1.95],[5,0,2],
       [0,0,-2.5],[0,3.5,-4],[0,3.5,4],[0,0,2.5],
       [0,0,-0.2],[0,0,-0.2],[0,0,0.2],[0,0,0.2]
	]);

	this.supUPback = new Patch(this.scene, 3, 20, 20, [
	   [8,0,0],[8,1.8,0],[8,1.8,0],[8,0,0],
	   [7.95,0,-1],[7.95,2,-2],[7.95,2,2],[7.95,0,1],
	   [6,0,-2],[6,3,-1.95],[6,3,1.95],[6,0,2],
       [5,0,-2],[5,3.5,-1.95],[5,3.5,1.95],[5,0,2],
	]);

	this.supDOWNfront = new Patch(this.scene, 3, 20, 20, [

       [0,0,-0.2],[0,0,0],[0,0,0],[0,0,0.2],
	   [0,0,-2.5],[0,-1.5,-2.5],[0,-1.5,2.5],[0,0,2.5],
	   [5,0,-2],[5,-1.5,-2],[5,-1.5,2],[5,0,2],
       [5,0,-2],[5,-1.5,-2],[5,-1.5,2],[5,0,2]
	]);

	this.supDOWNback = new Patch(this.scene, 3, 20, 20, [
	   [5,0,-2],[5,-1.5,-2],[5,-1.5,2],[5,0,2],
	    [6,0,-2],[6,-1.5,-2],[6,-1.5,2],[6,0,2],
	    [7.95,0,-1],[7.95,-1,-0.5],[7.95,-1,0.5],[7.95,0,1],
	    [8,0,0],[8,0,0],[8,0,0],[8,0,0]
	]);

	this.tailTop = new Patch(this.scene,2,20,20, [
		[13, 1.85, -0.2],[13, 2.15, 0],[13, 1.85, 0.2],
		[9, 1.75, -0.5],[9, 2.5, 0],[9, 1.75, 0.5],
		[7.1, 1.5, -0.525],[4.8, 3, 0],[7.1, 1.5, 0.525]
	]);

	this.tailBottom = new Patch(this.scene,2,20,20, [
		[7.1, 1.5, -0.525],[8.85, 0, 0],[7.1, 1.5, 0.525],
		[9, 1.75, -0.5],[12, 1, 0],[9, 1.75, 0.5],
		[13, 1.85, -0.2],[13,1.55, 0],[13, 1.85, 0.2],
	]);

	this.tailCover = new Patch(this.scene,2,20,20, [
		[13, 1.85, -0.2],[13,1.55, 0],[13, 1.85, 0.2],
		[13, 1.85, -0.2],[13.1, 1.85, 0],[13, 1.85, 0.2],
		[13, 1.85, -0.2],[13, 2.15, 0],[13, 1.85, 0.2]
	]);

	this.wingTopFront = new Patch(this.scene, 1, 20, 20, [
		[13, 3.5, 0],[13.5,3.5, 0],
		[12.25, 2.025, 0],[13, 2, 0]
	]);

	this.wingTopBack = new Patch(this.scene, 1, 20, 20, [
		[12.25, 2.025, 0],[13, 2, 0],
		[13, 3.5, 0],[13.5,3.5, 0]
	]);

	this.wingDownFront = new Patch(this.scene, 1, 20, 20, [
		[12.25, 1.6, 0],[13, 1.7, 0],
		[13, 0.2, 0],[13.5,0.2, 0]
	]);

	this.wingDownBack = new Patch(this.scene, 1, 20, 20, [
		
		[13, 0.2, 0],[13.5,0.2, 0],
		[12.25, 1.6, 0],[13, 1.7, 0]
		
	]);

	this.topFront = new Patch(this.scene, 2, 20, 20, [
		
		[4, 2.55, 0],[4.125, 4, 0],[4.25, 5, 0],
		[4.5, 2.55, 0.5],[4.5, 4, 0.5],[4.5, 5, 0.5],
		[5, 2.6, 0],[4.875, 4, 0],[4.75, 5, 0]
		
	]);

	this.topBack = new Patch(this.scene, 2, 20, 20, [
		[5, 2.6, 0],[4.875, 4, 0],[4.75, 5, 0],
		[4.5, 2.55, -0.5],[4.5, 4, -0.5],[4.5, 5, -0.5],
		[4, 2.55, 0],[4.125, 4, 0],[4.25, 5, 0]
		
	]);

	this.topCover = new Patch(this.scene, 2, 20, 20, [
		[4.75, 5, 0],[4.75, 5, 0],[4.75, 5, 0],
		[4.5, 5, -0.5],[4.5, 5.5, 0],[4.5, 5, 0.5],
		[4.25, 5, 0],[4.25, 5, 0],[4.25, 5, 0]

	]);
	
	this.cover = new Patch(this.scene, 2, 20, 20, [
		[4.23, 4.9, -0.23],[4.5, 4.9, -0.5],[4.77, 4.9, -0.23],
		[4, 4.9, 0],[4.5, 5.5, 0],[5, 4.9, 0],
		[4.23, 4.9, 0.23],[4.5, 4.9, 0.5],[4.77, 4.9, 0.23]
	]);

	this.downCover = new Patch(this.scene, 2, 20, 20, [
		[4.23, 4.9, 0.23],[4.5, 4.9, 0.5],[4.77, 4.9, 0.23],
		[4, 4.9, 0],[4.5, 5.5, 0],[5, 4.9, 0],
		[4.23, 4.9, -0.23],[4.5, 4.9, -0.5],[4.77, 4.9, -0.23]
	]);

	this.backBladeSupportTOP = new Patch(this.scene, 2, 20, 20, [
		[3.2, 5, -1.2],[3.4, 5.37, -1.2],[3.6, 5, -1.2],
		[3.2, 5, -0.9], [3.4, 5.37, -0.9], [3.6, 5, -0.9],
		[3.2, 5, -0.8],[3.4, 5.37, -0.8], [3.6, 5, -0.8]

	]);

	this.backBladeSupportBOTTOM = new Patch(this.scene, 2, 20, 20, [
		[3.2, 5, -0.8],[3.4, 4.63, -0.8], [3.6, 5, -0.8],
		[3.2, 5, -0.9], [3.4, 4.63, -0.9], [3.6, 5, -0.9],
		[3.2, 5, -1],[3.4, 4.63, -1],[3.6, 5, -1]

	]);


	this.legLeft = new Patch(this.scene, 3, 20, 20, [

       [0.1,0,-0.1],[0,0,-0.05],[0,0,0.05],[0.1,0,0.1],
	   [0.1,0,-0.1],[0,-0.25,-0.1],[0,-0.25,0.1],[0.1,0,0.1],
	   [7.9,0,-0.1],[8,-0.25,-0.1],[8,-0.25,0.1],[7.9,0,0.1],
       [7.9,0,-0.1],[8,0,-0.05],[8,0,0.05],[7.9,0,0.1]
	]);

	this.legRight = new Patch(this.scene, 3, 20, 20, [

	   [7.9,0,-0.1],[8,0,-0.05],[8,0,0.05],[7.9,0,0.1],
	   [7.9,0,-0.1],[8,0.25,-0.1],[8,0.25,0.1],[7.9,0,0.1],
	   [0.1,0,-0.1],[0,0.25,-0.1],[0,0.25,0.1],[0.1,0,0.1],
       [0.1,0,-0.1],[0,0,-0.05],[0,0,0.05],[0.1,0,0.1]
	]);

	this.leg = new Patch(this.scene, 2, 20, 20, [
		
		[2, 0.1, 2.95],[2, 2, 2],[2, 3, 1],
		[2.1, 0.1, 3.15],[2.1, 2, 2.2],[2.1, 3, 1.2],
		[2.2, 0.1, 2.95],[2.2, 2, 2],[2.2, 3, 1]
		
	]);

	this.leg1 = new Patch(this.scene, 2, 20, 20, [
		[2.2, 0.1, 2.95],[2.2, 2, 2],[2.2, 3, 1],
		[2.1, 0.1, 2.85],[2.1, 2, 1.8],[2.1, 3, 0.8],
		[2, 0.1, 2.95],[2, 2, 2],[2, 3, 1]
		
	]);

	this.leg2 = new Patch(this.scene, 2, 20, 20, [
		[2.2, 0.1, -2.95],[2.2, 2, -2],[2.2, 3, -1],
		[2.1, 0.1, -3.15],[2.1, 2, -2.2],[2.1, 3, -1.2],
		[2, 0.1, -2.95],[2, 2, -2],[2, 3, -1]
		
	]);

	this.leg3 = new Patch(this.scene, 2, 20, 20, [
		[2, 0.1, -2.95],[2, 2, -2],[2, 3, -1],
		[2.1, 0.1, -2.85],[2.1, 2, -1.8],[2.1, 3, -0.8],
		[2.2, 0.1, -2.95],[2.2, 2, -2],[2.2, 3, -1]
		
	]);

	this.brown = new CGFappearance(this.scene);
	this.brown.setAmbient(0.15,0.1,0,1);
	this.brown.setDiffuse(0.15,0.1,0,1);
	this.brown.setSpecular(0.2,0.12,0,1);
	this.brown.setShininess(200); 

	this.metal = new CGFappearance(this.scene);
	this.metal.loadTexture('textures/metal.jpg');
	this.metal.setAmbient(0.07,0.05,0.03,1);
	this.metal.setDiffuse(0.6,0.6,0.6,1);
	this.metal.setSpecular(0.3,0.3,0.3,1); 
	this.metal.setShininess(200); 
	
	this.exercito = new CGFappearance(this.scene);
	this.exercito.loadTexture('textures/exercito.jpg');
	this.exercito.setAmbient(0.6,0.6,0.6,1);
	this.exercito.setDiffuse(0.6,0.6,0.6,1);
	this.exercito.setSpecular(0.8,0.8,0.8,1); 
	this.exercito.setShininess(200); 

	this.aviaoFrente = new CGFappearance(this.scene);
	this.aviaoFrente.loadTexture('textures/frente-avião.jpg');
	this.aviaoFrente.setAmbient(0.6,0.6,0.6,1);
	this.aviaoFrente.setDiffuse(0.6,0.6,0.6,1);
	this.aviaoFrente.setSpecular(0.8,0.8,0.8,1); 
	this.aviaoFrente.setShininess(200); 
	

};

HelicopterBody.prototype = Object.create(CGFobject.prototype);
HelicopterBody.prototype.constructor=HelicopterBody;


HelicopterBody.prototype.display = function() {

	this.scene.pushMatrix();
		this.scene.translate(-4.5,0,0);
		this.scene.pushMatrix();
			this.scene.translate(0,2,0);
			
			//Corpo do helicoptero
			this.aviaoFrente.apply();
			this.supUPfront.display();
			this.exercito.apply();
			this.supUPback.display();
			this.supDOWNfront.display();
			this.supDOWNback.display();

			//Cauda do helicoptero
			this.brown.apply();
			this.tailTop.display();
			this.tailBottom.display();
			this.tailCover.display();
			this.wingTopFront.display();
			this.wingTopBack.display();
			this.wingDownFront.display();
			this.wingDownBack.display();

			//Suporte das helices de cima
			this.topFront.display();
			this.topBack.display();
			this.topCover.display();

			this.scene.pushMatrix();
			this.scene.translate(0, 0.3, 0);
			this.cover.display();
			this.downCover.display();
			this.scene.popMatrix();
			
			//Suporte das helices de tras
			this.scene.pushMatrix();
			this.scene.translate(9.1, 1.82, -2.6);
			this.scene.rotate(90*Math.PI/180.0, 1, 0, 0);
			this.scene.scale(0.8, 0.6, 0.75);
			this.topCover.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
			this.scene.translate(9.3, -3.18, 1.2);
			this.backBladeSupportTOP.display();
			this.backBladeSupportBOTTOM.display();
			this.scene.popMatrix();
		this.scene.popMatrix();

		//Suporte do helicoptero
		this.scene.pushMatrix();
		this.scene.translate(0, 0, 3);
		this.metal.apply();
		this.legLeft.display();
		this.legRight.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
		this.scene.translate(0, 0, -3);
		this.legLeft.display();
		this.legRight.display();
		this.scene.popMatrix();

		this.leg.display();
		this.leg1.display();
		this.leg2.display();
		this.leg3.display();

		this.scene.pushMatrix();
		this.scene.translate(3, 0, 0);
		this.leg.display();
		this.leg1.display();
		this.leg2.display();
		this.leg3.display();
		this.scene.popMatrix();
 	this.scene.popMatrix();
}