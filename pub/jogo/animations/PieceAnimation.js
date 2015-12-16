/**
 * PieceAnimation
 * @constructor
 */
function PieceAnimation(scene, object, p1, p2, newCoords, finishedHandler) {
    this.scene = scene;
    
    this.delta = [p2[0] - p1[0], 0, p2[1] - p1[1]];
    this.newCoords = newCoords;
    
    this.normal;
    this.rotation = 0;
    this.moveRotation;
    this.object = object;
    this.running = true;
    this.finishedHandler = finishedHandler;
    
    this.totalLength = Math.sqrt(Math.pow(this.delta[0], 2) + Math.pow(this.delta[2], 2));
    this.timespan = 2;
    this.calculateNormalAndRotation();

    this.rotationTime = Math.abs(this.moveRotation) > 0 ? 1 : 0;//Math.abs(this.moveRotation/Math.PI);
    
    this.stage = 0;

    this.wave = 0;
}

function easeInOutCubic(t) {
    t *= 2;
    if (t < 1)
        return 1 / 2 * t * t * t;
    t -= 2;
    return 1 / 2 * (t * t * t + 2);
};

// Função que inicia a animação
PieceAnimation.prototype.start = function(startTime) 
{
    this.position = [0, 0, 0];
    this.startTime = startTime;
}

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
    var t = (currTime - this.startTime - sectionStart*1000) / (this.timespan * 1000);
    this.wave = (-4*Math.pow((t-0.5),2)+1)*0.2*Math.sin(5*t*Math.PI);
    var currLength = easeInOutCubic(t) * this.totalLength;
    if (currLength >= this.totalLength) 
    {
        this.wave = 0;
        this.position = this.delta;
        this.stage++;
    } 
    else 
    {
        for (var coord = 0; coord <= 2; coord++) 
        {
            this.position[coord] = currLength * this.normal[coord];
        }
    }
}

PieceAnimation.prototype.updateRotationSection = function(currTime, firstRot, sectionStart)
{
    if (this.rotationTime == 0)
    {
        this.stage++;
        return;
    }
    var t = (currTime - this.startTime - sectionStart*1000)/(this.rotationTime*1000);
    if (t >= 1)
    {
        this.rotation = firstRot ? this.moveRotation : 0;
        this.stage++;
    }
    if (firstRot) var currRotation = easeInOutCubic(t) * this.moveRotation;
    else var currRotation = this.moveRotation * (1 - easeInOutCubic(t));
    this.rotation = currRotation;
}

// Função que atualiza a animação
PieceAnimation.prototype.update = function(currTime) {
    if (this.running) {
        if (!this.startTime) 
        {
            this.startTime = currTime;
            this.position = [0, 0, 0];
        } 
        else 
        {
            if (this.stage == 0) 
            {
                this.updateRotationSection(currTime, true, 0)
            } 
            if (this.stage == 1) 
            {
                this.updateLinearSection(currTime, this.rotationTime);
            }
            if (this.stage == 2)
            {
                this.updateRotationSection(currTime, false, this.timespan+this.rotationTime)
            }
            if (this.stage == 3)
            {
                this.running = false;
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
