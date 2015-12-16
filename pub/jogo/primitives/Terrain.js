function Terrain(scene, texture_path, height_map_path) {
	CGFobject.call(this,scene);
	this.plane = new Plane(scene,200);
	this.height_map = new CGFtexture(scene,scene.getScenePath() + height_map_path);
	this.texture = new CGFtexture(scene,scene.getScenePath() + texture_path);
	this.initBuffers();
};

Terrain.prototype = Object.create(CGFobject.prototype);
Terrain.prototype.constructor = Terrain;

Terrain.prototype.display = function () {
	this.height_map.bind(1);
	this.texture.bind();
	this.scene.setActiveShader(this.scene.terrainShader);
	this.plane.display();
	this.scene.setActiveShader(this.scene.defaultShader);
	this.texture.unbind();
}



