function Patch(scene, order, partsU, partsV, controlPoints) {
	CGFobject.call(this,scene);

    this.order = order;
    this.partsU = partsU;
    this.partsV = partsV;
    this.controlPoints = controlPoints;

	this.initBuffers();
};

Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.initBuffers = function() {
	
	var nurbsSurface = new CGFnurbsSurface(this.order, this.order,
								this.getPointsOrder(this.order),
								this.getPointsOrder(this.order),
								this.getControlPoints(this.order,this.controlPoints));
					
	var getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.obj = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsU, this.partsV );	

	
};

Patch.prototype.getPointsOrder = function (order){
	var pointsOrder = [];
	for (var n = 0; n <= 1; n++)
		for (var i = 0; i < order+1; i++)
			pointsOrder.push(n);
	return pointsOrder;
};

Patch.prototype.getControlPoints = function (order, controlPoints){
	order++;
	var result = [];
	var i = 0;
	for (var j = 0; j < order; j++)
	{
		var array = [];
		for (var o = 0; o < order; o++)
		{
			array.push([controlPoints[i][0],controlPoints[i][1], controlPoints[i][2], 1]);
			i++;
		}
		result.push(array);
	}
	return result;
}


Patch.prototype.display = function () {
	this.obj.display();
};



