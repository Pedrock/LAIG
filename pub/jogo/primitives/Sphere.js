/**
 * Sphere
 * @constructor
 */
function Sphere(scene, radius, stacks, slices, amplif_factor) {
    CGFobject.call(this, scene);
    
    this.slices = slices;
    this.stacks = stacks;
    this.radius = radius;
    
    this.minS = 0;
    this.maxS = 1;
    this.minT = 0;
    this.maxT = 1;
    
    this.initBuffers();
}
;

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function() {
    
    this.vertices = [];
    this.indices = [];
    this.texCoords = [];
    this.normals = [];
    
    for (var s = 0; s <= this.stacks; s++) 
    {
        var anguloZ = s*Math.PI/this.stacks;
    	var sinZ = Math.sin(anguloZ);
    	var cosZ = Math.cos(anguloZ);
    	
        for (var i = 0; i <= this.slices; i++) 
        {
            var angulo = i * 2 * Math.PI / this.slices;
            var cosAng = Math.cos(angulo);
            var sinAng = Math.sin(angulo);

            var normal = [cosAng * sinZ, sinAng * sinZ, cosZ];

            this.vertices.push(normal[0]*this.radius,normal[1]*this.radius,normal[2]*this.radius);
            this.normals = this.normals.concat(normal);
            this.texCoords.push((i / this.slices) * (this.maxS - this.minS) + this.minS);
            this.texCoords.push(s / this.stacks * (this.maxT - this.minT) + this.minT);
            
            var offset0 = ((s-1) * (this.slices+1) + i);
            var offset1 = (s * (this.slices+1) + i);
            
            if (s > 0 && i < this.slices)
            {
                this.indices.push(offset0+1,offset0,offset1);
                this.indices.push(offset1,offset1+1,offset0+1);
            }
        }
    }
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}
;
