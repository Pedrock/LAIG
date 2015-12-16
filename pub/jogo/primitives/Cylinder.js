 /**
     * Cylinder
     * @constructor
     */
function Cylinder(scene, height, bottom_radius, top_radius, stacks, slices) {
    CGFobject.call(this, scene);
    
    this.slices = slices;
    this.stacks = stacks;
    this.height = height;
    this.bottom_radius = bottom_radius;
    this.top_radius = top_radius;
    
    this.minS = 0;
    this.maxS = 1;
    this.minT = 0;
    this.maxT = 1;
    
    this.initBuffers();
}
;

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    var normalZ = (2*Math.atan(this.height / Math.abs(this.top_radius - this.bottom_radius)) - Math.PI) / Math.PI;
    if (this.bottom_radius > this.top_radius) normalZ = -normalZ;
    
    for (var i = 0; i <= this.slices; i++) 
    {
        var angulo = i * 2 * Math.PI / this.slices;
        this.vertices.push(this.bottom_radius*Math.sin(angulo), this.bottom_radius*Math.cos(angulo), 0);
        this.texCoords.push((i / this.slices)*(this.maxS-this.minS)+this.minS, this.minT);
        var normal = [Math.sin(angulo), Math.cos(angulo), normalZ];
        var m = Math.sqrt(1 - normalZ*normalZ);
        normal = [normal[0]*m,normal[1]*m,normal[2]];
        this.normals = this.normals.concat(normal);
    }
    
    for (var s = 1; s <= this.stacks; s++) 
    {
        var z = s / this.stacks*this.height;
        
        for (var i = 0; i <= this.slices; i++) 
        {
            var angulo = i * 2 * Math.PI / this.slices;

            var radius = (this.top_radius-this.bottom_radius)*s/this.stacks+this.bottom_radius;
            
            this.vertices.push(radius*Math.sin(angulo), radius*Math.cos(angulo), z);
            this.texCoords.push((i / this.slices)*(this.maxS-this.minS)+this.minS);
            this.texCoords.push(s / this.stacks*(this.maxT-this.minT)+this.minT);

             var normal = [Math.sin(angulo), Math.cos(angulo), normalZ];
             var m = Math.sqrt(1 - normalZ*normalZ);
             normal = [normal[0]*m,normal[1]*m,normal[2]];
             this.normals = this.normals.concat(normal);
            
            var offset0 = ((s - 1) * (this.slices + 1) + i);
            var offset1 = (s * (this.slices + 1) + i);
            
            if (i < this.slices) 
            {
                this.indices.push(offset1 + 1, offset0 + 1, offset0);
                this.indices.push(offset1, offset1 + 1, offset0);
            }
        }
    }
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
