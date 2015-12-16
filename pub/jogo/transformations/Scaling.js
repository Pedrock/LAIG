function Scaling(sx, sy, sz) {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
};

Scaling.prototype.applyTo = function(matrix)
{
     mat4.scale(matrix, matrix, [this.sx, this.sy, this.sz]);
}