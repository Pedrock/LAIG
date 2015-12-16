function Material(scene, shininess, specular, diffuse, ambient, emission) {
    this.scene = scene;
    this.shininess = shininess;
    this.specular = specular;
    this.diffuse = diffuse;
    this.ambient = ambient;
    this.emission = emission;
}

Material.prototype.apply = function() 
{
    this.scene.setShininess(this.shininess);
    this.scene.setSpecular.apply(this.scene, this.specular);
    this.scene.setDiffuse.apply(this.scene, this.diffuse);
    this.scene.setAmbient.apply(this.scene, this.ambient);
    this.scene.setEmission.apply(this.scene, this.emission);
}
