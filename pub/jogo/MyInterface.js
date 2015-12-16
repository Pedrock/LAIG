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
    return true;
}