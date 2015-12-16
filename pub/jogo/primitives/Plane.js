function Plane(scene, nrDivs) {
	CGFobject.call(this,scene);
    this.nrDivs = nrDivs;
	this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.initBuffers = function() {
	
	var nurbsSurface = new CGFnurbsSurface(1, // degree on U: 2 control vertexes U
					 1, // degree on V: 2 control vertexes on V
					[0, 0, 1, 1], // knots for U
					[0, 0, 1, 1], // knots for V
					[	// U = 0
						[ // V = 0..1;
							 [-0.5, 0, 0.5, 1 ],
							 [-0.5, 0, -0.5, 1 ]
							
						],
						// U = 1
						[ // V = 0..1
							 [ 0.5, 0, 0.5, 1 ],
							 [ 0.5, 0, -0.5, 1 ]							 
						]
					]);
					
	var getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.obj = new CGFnurbsObject(this.scene, getSurfacePoint, this.nrDivs, this.nrDivs );	
	
};


Plane.prototype.display = function () {
	this.obj.display();
}



