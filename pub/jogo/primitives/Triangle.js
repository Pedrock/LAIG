 /**
 * Triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Triangle(scene, p1, p2, p3, amplif_factor) {
    CGFobject.call(this, scene);

    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.amplif_factor = amplif_factor;

    this.initBuffers();
};

Triangle.prototype = Object.create(CGFobject.prototype);
Triangle.prototype.constructor = Triangle;

Triangle.prototype.initBuffers = function() {
    this.vertices = this.p1.concat(this.p2).concat(this.p3);
    
    this.indices = [
        0, 1, 2
    ];

    var v = [this.p2[0]-this.p1[0],this.p2[1]-this.p1[1],this.p2[2]-this.p1[2]];
    var w = [this.p3[0]-this.p1[0],this.p3[1]-this.p1[1],this.p3[2]-this.p1[2]];
    var normal = [v[1]*w[2]-v[2]*w[1],v[2]*w[0]-v[0]*w[2],v[0]*w[1]-v[1]*w[0]];
    var div = Math.sqrt(normal[0]*normal[0]+normal[1]*normal[1]+normal[2]*normal[2]);
    var normal = [normal[0]/div,normal[1]/div,normal[2]/div];
    
    this.normals = normal.concat(normal).concat(normal);

    var a = Math.sqrt(Math.pow(this.p3[0]-this.p2[0],2)+Math.pow(this.p3[1]-this.p2[1],2)+Math.pow(this.p3[2]-this.p2[2],2)); //BC
    var b = Math.sqrt(Math.pow(this.p3[0]-this.p1[0],2)+Math.pow(this.p3[1]-this.p1[1],2)+Math.pow(this.p3[2]-this.p1[2],2)); //AC
    var c = Math.sqrt(Math.pow(this.p2[0]-this.p1[0],2)+Math.pow(this.p2[1]-this.p1[1],2)+Math.pow(this.p2[2]-this.p1[2],2)); //AB
    
    var cosB = (a*a-b*b+c*c)/(2*a*c);
    var sinB = Math.sin(Math.acos(cosB));

    this.texCoords = [
        0, a*sinB/this.amplif_factor[1], 
        c / this.amplif_factor[0], a*sinB/this.amplif_factor[1],
        (c-a*cosB)/this.amplif_factor[0], 0
    ];
    
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
