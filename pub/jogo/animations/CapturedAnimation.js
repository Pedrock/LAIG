/**
 * CapturedAnimation
 * @constructor
 */
function CapturedAnimation(scene, player, object, delta, moveAnimation, reversed, fast) {
    this.scene = scene;
    
    this.delta = [delta[0], 10, delta[1]];
    this.player = player;
    
    this.object = object;
    this.running = true;
    this.moveAnimation = moveAnimation;

    this.reversed = reversed;
    this.reversedTime = null;
    this.prevCurrTime = 0;

    this.timespan = 2 / (fast ? 10: 1);
}

function easeInOutCubic(t) {
    t *= 2;
    if (t < 1)
        return 1 / 2 * t * t * t;
    t -= 2;
    return 1 / 2 * (t * t * t + 2);
};

function arc(t)
{
    return -4*Math.pow(t-0.5,2)+1;
}

CapturedAnimation.prototype.getTime = function(startTime, currTime, timespan)
{
    if (!this.reversed) return (currTime - startTime)/timespan;
    else if (this.reversedTime) return (this.reversedTime - startTime)/timespan - (currTime - this.reversedTime)/timespan;
    else return 1 - (currTime - startTime)/timespan;
}

// Função que atualiza a animação
CapturedAnimation.prototype.update = function(currTime) {
    this.prevCurrTime = currTime;
    if (this.running) {
        if (!this.startTime) 
        {
            this.startTime = currTime;
            this.position = this.reversed ? [this.delta[0],0,this.delta[2]] : [0, 0, 0];
        } 
        else 
        {
            var time = this.getTime(this.startTime,currTime,this.timespan*1000);
            var t = Math.max(0,Math.min(1,time));
            var easing = easeInOutCubic(t);
            this.position = [easing*this.delta[0],arc(t)*this.delta[1],easing*this.delta[2]];
            if (time > 1 || time < 0)
            {
                this.running = false;
                this.moveAnimation.captureFinished();
            }
        }
    }
}

CapturedAnimation.prototype.reverse = function()
{
    if (!this.reversed)
    {
        this.reversed = true;
        this.reversedTime = this.prevCurrTime;
        if (!this.running)
        {
            this.running = true;
            this.startTime = this.prevCurrTime-this.timespan*1000;
        }
    }
}

// Função que aplica as transformações da animação
CapturedAnimation.prototype.apply = function() {
    this.scene.translate.apply(this.scene, this.position);
}
