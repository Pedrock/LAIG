function Node(scene, id, material, texture) {
    this.scene = scene;
    this.id = id;
    this.isLeaf = false;
    this.material = material;
    this.texture = texture;
    this.transformations = [];
    this.descendants = [];
    this.matrix = null;
    this.animations = [];
    this.currAnimation = 0;
    this.animationsRunning = false;
    this.animationsFinished = false;
    this.animationStartTime = null;
    this.totalAnimationTime = 0;
    this.totalTimePerAnimation = {};
    this.totalTimePerAnimation[-1] = 0;
}

Node.prototype.addAnimation = function(animationID)
{
	var animation = this.scene.graph.animations[animationID];
	if (!animation)
	{
		console.warn("Invalid animation in use: '"+animationID+"'.");
		return;
	}
    this.animations.push(animation);
    this.totalAnimationTime += animation.timespan*1000;
    this.totalTimePerAnimation[this.animations.length-1] = this.totalAnimationTime;
}

Node.prototype.startAnimations = function()
{
    if (this.animations.length > 0)
    {
        this.currAnimation = 0;
        this.animationsRunning = true;
        this.animationStartTime = null;
        this.animationsFinished = false;
        this.getAnimation().start(this.id);
    }
}

Node.prototype.update = function(currTime)
{
    if (this.animationsRunning && !this.animationsFinished)
    {
        if (this.animationStartTime === null) this.animationStartTime = currTime;
        else
        {
            var elapsedTime = currTime - this.animationStartTime;
            while (elapsedTime > this.totalTimePerAnimation[this.currAnimation] && this.currAnimation <= this.animations.length)
			{
			    this.getAnimation().update(this.id,currTime);
				this.currAnimation++;
				if (this.currAnimation < this.animations.length) {
					var startTime = this.animationStartTime + this.totalTimePerAnimation[this.currAnimation-1];
					this.getAnimation().start(this.id,startTime);
				}
				else {
			         this.animationsFinished = true;
				}
			}
			if (this.animationsFinished) this.currAnimation--;
			this.getAnimation().update(this.id,currTime);
        }
    }
}

Node.prototype.getAnimation = function(i)
{
    if (i === undefined) i = this.currAnimation;
    return this.animations[i];
}

Node.prototype.display = function(material, texture) 
{
    this.scene.pushMatrix();
    this.scene.multMatrix(this.matrix);
    if (this.animations.length > 0)
    {
         this.getAnimation().apply(this.id);
    }
    var scene = this.scene;
    
    for (var i = 0; i < this.descendants.length; i++) 
    {
        var desc = this.scene.graph.nodes[this.descendants[i]];
        desc.display(this.material != "null" ? this.material : material, this.texture != "null" ? this.texture : texture);
    }
    this.scene.popMatrix();
}

Node.prototype.createTransformationsMatrix = function()
{
    if (this.matrix) return;
    this.matrix = mat4.create();
    for (var i = 0; i < this.transformations.length; i++) 
    {
        this.transformations[i].applyTo(this.matrix);
    }
}

