function Rotation(axis, angle) {
    this.axis = axis;
    this.angle = Math.PI*angle/180;
};

Rotation.prototype.applyTo = function(matrix)
{
    mat4.rotate(matrix,matrix,this.angle,[this.axis == 'x' ? 1 : 0, this.axis == 'y' ? 1 : 0, this.axis == 'z' ? 1 : 0]);
}