
function XMLscene() {
    this.lightsStatus = {}; // Estado das luzes
    this.currentTexture = null;
    
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.cameraPosition = vec3.fromValues(0, 5, 5);

    this.initCameras();
    
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    
    this.enableTextures(true);
    
    this.axis = new CGFaxis(this);

    this.setUpdatePeriod(1000/60);

    this.cameraAngle = 0;
    this.cameraAnimationStart = 0;

    this.textShader=new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");

	// set number of rows and columns in font texture
	this.textShader.setUniformsValues({'dims': [10, 2]});

	this.infoBoard = new InfoBoard(this);
};


XMLscene.prototype.initCameras = function() {
    this.gameCamera = new CGFcamera(0.4,0.1,500,this.cameraPosition.slice(),vec3.fromValues(0, 0, 0));
    this.freeCamera = new CGFcamera(0.4,0.1,500,this.cameraPosition.slice(),vec3.fromValues(0, 0, 0));
    this.camera = this.gameCamera;
}
;

XMLscene.prototype.updateFrustum = function() 
{
    this.gameCamera.far = this.graph.initials.frustum.far;
    this.gameCamera.near = this.graph.initials.frustum.near;
    this.freeCamera.far = this.graph.initials.frustum.far;
    this.freeCamera.near = this.graph.initials.frustum.near;
}


XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(1, 0, 0, 1.0);
    this.setDiffuse(1, 0, 0, 1.0);
    this.setSpecular(1, 0, 0, 1.0);
    this.setShininess(10.0);
};

XMLscene.prototype.getScenePath = function()
{
    return this.path;
}

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() 
{
    this.gl.clearColor(this.graph.illumination.background[0], this.graph.illumination.background[1], this.graph.illumination.background[2], this.graph.illumination.background[3]);
    this.initLights();
    this.updateFrustum();
    this.axis = new CGFaxis(this,this.graph.initials.referenceLength);
    if (this.graph.nodes["board"])
    {
        this.board = this.graph.nodes["board"].objects[0];
        this.currentPlayer = this.board.currentPlayer;
        this.infoBoard = new InfoBoard(this,this.board);
    }
}
;

XMLscene.prototype.initLights = function() {
    var i = 0;
    for (var id in this.graph.lights) 
    {
        if (i == this.lights.length) 
        {
            console.warn("Maximum number of lights reached.");
            break;
        }
        var light = this.graph.lights[id];
        
        this.lights[i].setVisible(true);
        if (light.enabled)
            this.lights[i].enable();
        else
            this.lights[i].disable();
        
        this.lights[i].setPosition.apply(this.lights[i], light.position);
        this.lights[i].setAmbient.apply(this.lights[i], light.ambient);
        this.lights[i].setDiffuse.apply(this.lights[i], light.diffuse);
        this.lights[i].setSpecular.apply(this.lights[i], light.specular);
        this.lights[i].lightId = id;
        i++;
    }
    this.numberLights = i;
    this.setGlobalAmbientLight.apply(this, this.graph.illumination.ambient);
}

XMLscene.prototype.updateLights = function() {
    for (var i = 0; i < this.numberLights; i++) 
    {
        this.lights[i].update();
    }
}

XMLscene.prototype.display = function() {
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    if (this.infoBoard)
        this.infoBoard.display();
   
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();
    
    if (this.graph.loadedOk)
        this.initialTransformations();

    
    // Draw axis
     
    if (this.graph.initials.referenceLength) this.axis.display();
    
    // ---- END Background, camera and axis setup
    
    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) 
    {
        this.updateLights();
        this.setDefaultAppearance();
        if (this.graph.rootNodeId && this.graph.nodes[this.graph.rootNodeId]) 
            this.graph.nodes[this.graph.rootNodeId].display("null", "clear");
    };
    
    this.setActiveShaderSimple(this.textShader);

    this.setActiveShaderSimple(this.defaultShader);
}
;

XMLscene.prototype.initialTransformations = function() 
{
    for (var i = 0; i < this.graph.initials.translations.length; i++) 
    {
        this.translate.apply(this, this.graph.initials.translations[i]);
    }
    for (var i = 0; i < this.graph.initials.rotations.length; i++) 
    {
        var rotation = this.graph.initials.rotations[i];
        this.rotate(rotation.angle, rotation.axis == 'x' ? 1 : 0, rotation.axis == 'y' ? 1 : 0, rotation.axis == 'z' ? 1 : 0)
    }
    for (var i = 0; i < this.graph.initials.scalings.length; i++) 
    {
        this.scale.apply(this, this.graph.initials.scalings[i]);
    }
}

XMLscene.prototype.update = function(currTime)
{
    for (var id in this.graph.nodes)
    {
        if (this.graph.nodes[id] && !this.graph.nodes[id].isLeaf) this.graph.nodes[id].update(currTime);
    }
    if (this.board)
    {
        this.board.update(currTime);
        this.updateCamera(currTime);
    }
}

function easeInOutQuad(t) {
    t *= 2;
    if (t < 1)
        return 1 / 2 * t * t;
    t--;
    return -1 / 2 * (t * (t-2) - 1);
};

XMLscene.prototype["Rotate"] = function()
{
    this.board.switchPlayer();
    this.board.getValidMoves();
}

XMLscene.prototype.updateCamera = function(currTime)
{
    this.gameCamera.position = this.cameraPosition.slice();
    if (this.board.currentPlayer != this.currentPlayer) 
    {
        this.cameraAnimationStart = currTime;
        this.currentPlayer = this.board.currentPlayer;
    }
    var t = Math.min(1000,currTime - this.cameraAnimationStart)/1000;
    if (this.board.currentPlayer == 2)
        this.gameCamera.orbit(CGFcameraAxis.Y,Math.PI*easeInOutQuad(t));
    else
        this.gameCamera.orbit(CGFcameraAxis.Y,Math.PI*(1-easeInOutQuad(t)));
}
