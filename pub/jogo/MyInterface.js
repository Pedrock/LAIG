function MyInterface() {
	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

MyInterface.prototype["Change Camera"] = function() {
	if (this.activeCamera == null)
	{
		this.scene.camera = this.scene.freeCamera;
		this.setActiveCamera(this.scene.freeCamera);
	}
	else
	{
		this.scene.camera = this.scene.gameCamera;
		this.setActiveCamera(null);
	}
}

MyInterface.prototype.init = function(application) {
    CGFinterface.prototype.init.call(this, application);
    this.gui = new dat.GUI();
	this.gui.add(this.scene,"Rotate");
	this.gui.add(this,"Change Camera");
	this.scene["Silver Player"] = 0;
	var self = this;
	this.gui.add(this.scene,"Silver Player", {'Human':0,'Random':1,'AI':2}).onFinishChange(function() {self.scene.changePlayers()});
	this.scene["Gold Player"] = 0;
	this.gui.add(this.scene,"Gold Player", {'Human':0,'Random':1,'AI':2}).onFinishChange(function() {self.scene.changePlayers()});
	this.gui.add(this,"Load LSX");
	this.gui.add(this.scene,"Undo");
    return true;
}

MyInterface.prototype["Load LSX"] = function() 
{
	var filename=getUrlVars()['file'] || "default.lsx";
    new MySceneGraph(filename, this.scene);
}