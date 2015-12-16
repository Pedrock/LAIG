function Translation(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Translation.prototype.applyTo = function(matrix)
{
    mat4.translate(matrix,matrix,[this.x,this.y,this.z]);
}