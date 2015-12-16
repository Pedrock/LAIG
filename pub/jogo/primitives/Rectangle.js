 /**
 * Rectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Rectangle(scene, p1, p2, amplif_factor) {
    CGFobject.call(this, scene);
   
    this.p1 = p1;
    this.p2 = p2;

    this.minS = 0;
    this.maxS = (Math.max(p1[0],p2[0])-Math.min(p1[0],p2[0])) / amplif_factor[0];
    this.minT = 0;
    this.maxT = (Math.max(p1[1],p2[1])-Math.min(p1[1],p2[1])) / amplif_factor[1];
    
    this.initBuffers();
}
;

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.initBuffers = function() {
    this.texCoords = [
        this.minS, this.minT,
        this.minS, this.maxT,
        this.maxS, this.maxT,
        this.maxS, this.minT
    ];
    
    this.vertices = [
        this.p1[0], this.p1[1], 0,
        this.p1[0], this.p2[1], 0,        
        this.p2[0], this.p2[1], 0,
        this.p2[0], this.p1[1], 0
    ];
    
    this.indices = [
        0, 1, 2, 
        2, 3, 0
    ];
    
    this.normals = [
        0, 0, 1, 
        0, 0, 1, 
        0, 0, 1, 
        0, 0, 1
    ]
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
