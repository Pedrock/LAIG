/**
 * PieceAnimation
 * @constructor
 */
function PieceAnimation(scene, object, delta, finishedHandler, captureHandler, reversed) {
    this.scene = scene;
    
    this.delta = [delta[0], 0, delta[1]];
    
    this.normal;
    this.rotation = 0;
    this.moveRotation;
    this.object = object;
    this.running = true;
    this.finishedHandler = finishedHandler;
    this.captureHandler = captureHandler;
    this.captureHandlerCalled = false;
    
    this.totalLength = Math.sqrt(Math.pow(this.delta[0], 2) + Math.pow(this.delta[2], 2));
    this.timespan = 2;
    this.calculateNormalAndRotation();

    this.rotationTime = Math.abs(this.moveRotation) > 0 ? 1 : 0;
    
    this.stage = reversed ? 2 : 0;
    this.reversedTime = null;

    this.wave = 0;
    
    this.reversed = reversed;

    this.previousStageEnd    = 0;

    this.prevCurrTime = 0;

    this.captureFinishedState = false;
}

function easeInOutCubic(t) {
    t *= 2;
    if (t < 1)
        return 1 / 2 * t * t * t;
    t -= 2;
    return 1 / 2 * (t * t * t + 2);
};

// Função que calcula as direções e rotações para cada secção
PieceAnimation.prototype.calculateNormalAndRotation = function() 
{
    var N = Math.sqrt(this.delta[0] * this.delta[0] + this.delta[2] * this.delta[2]);
    if (N != 0)
        this.normal = [this.delta[0] / N, 0, this.delta[2] / N];
    else
        this.normal = [0, 0, 0];
    this.moveRotation = Math.atan2(this.normal[2], -this.normal[0]);
}

PieceAnimation.prototype.updateLinearSection = function(currTime,sectionStart) 
{
    var t = this.getSectionTime(this.startTime + sectionStart*1000, currTime, this.timespan*1000);
    this.wave = (-4*Math.pow((t-0.5),2)+1)*0.2*Math.sin(5*t*Math.PI);
    var currLength = easeInOutCubic(t) * this.totalLength;
    if (t > 1 || t < 0)
    {
        this.wave = 0;
        this.position = ((t > 1) ? this.delta : [0,0,0]);
        this.nextStage();
    }
    else 
    {
        for (var coord = 0; coord <= 2; coord++)
        {
            this.position[coord] = currLength * this.normal[coord];
        }
    }
}

PieceAnimation.prototype.getSectionTime = function(startTime, currTime, timespan)
{
    if (!this.reversed) return (currTime - startTime)/timespan;
    else if (this.reversedTime) return (this.reversedTime - startTime)/timespan - (currTime - this.reversedTime)/timespan;
    else return 1 - (currTime - startTime)/timespan;
}

PieceAnimation.prototype.updateRotationSection = function(currTime, firstRot, sectionStart)
{
    if (this.rotationTime == 0)
    {
        this.nextStage();
        return;
    }
    var t = this.getSectionTime(this.startTime + sectionStart*1000, currTime, this.rotationTime*1000);
    if (t > 1 || t < 0)
    {
        this.rotation = (firstRot && t > 1) ? this.moveRotation : 0;
        this.nextStage();
    }
    if (firstRot) var currRotation = easeInOutCubic(t) * this.moveRotation;
    else var currRotation = this.moveRotation * (1 - easeInOutCubic(t));
    this.rotation = currRotation;
}

PieceAnimation.prototype.nextStage = function()
{
     this.stage += (this.reversed ? -1 : 1);
     this.reversedTime = null;
     this.previousStageEnd = (this.prevCurrTime - this.startTime)/1000;
}

PieceAnimation.prototype.reverse = function()
{
    this.reversed = true;
    this.reversedTime = this.prevCurrTime;
}

PieceAnimation.prototype.captureFinished = function()
{
    this.captureFinishedState = true;
}

// Função que atualiza a animação
PieceAnimation.prototype.update = function(currTime) {
    this.prevCurrTime = currTime;
    if (this.running) {
        if (!this.startTime) 
        {
            this.startTime = currTime;
            this.position = this.reversed ? this.delta : [0, 0, 0]
        } 
        else 
        {
            if (this.stage == 0) 
            {
                this.updateRotationSection(currTime, true, this.previousStageEnd)
            } 
            if (this.stage == 1) 
            {
                if (!this.captureHandlerCalled && this.captureHandler) this.captureHandler();
                this.captureHandlerCalled = true;
                this.updateLinearSection(currTime, this.previousStageEnd);
            }
            if (this.stage == 2)
            {
                this.updateRotationSection(currTime, false, this.previousStageEnd)
            }
            if (this.stage == 3 || this.stage == -1)
            {
                if (!this.captureHandlerCalled && this.captureHandler) this.captureHandler();
                this.stage = 4;
            }
            if (this.stage == 4 && this.captureFinishedState)
            {
                this.running = false;
                if (this.endCaptureHandler)
                    this.endCaptureHandler(this.reversed);
                if (this.finishedHandler)
                    this.finishedHandler();
            }
        }
    }
}

// Função que aplica as transformações da animação
PieceAnimation.prototype.apply = function() {
    if (this.position) 
    {
        this.scene.translate.apply(this.scene, this.position);
        this.scene.rotate(this.rotation, 0, 1, 0);
        this.scene.rotate(this.wave,1,0,0);
    } 
    else 
    {
        this.scene.rotate(this.rotation, 0, 1, 0);
    }
}