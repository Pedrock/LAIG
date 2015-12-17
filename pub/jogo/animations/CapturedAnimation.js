/**
 * CapturedAnimation
 * @constructor
 */
function CapturedAnimation(scene, player, object, delta, finishedHandler) {
    this.scene = scene;
    
    this.delta = [delta[0], 10, delta[1]];
    this.player = player;
    
    this.object = object;
    this.running = true;
    this.finishedHandler = finishedHandler;
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
    // -(2*x-1)^4+1
}

// Função que inicia a animação
CapturedAnimation.prototype.start = function(startTime) 
{
    this.position = [0, 0, 0];
    this.startTime = startTime;
}

// Função que atualiza a animação
CapturedAnimation.prototype.update = function(currTime) {
    if (this.running) {
        if (!this.startTime) 
        {
            this.startTime = currTime;
            this.position = [0, 0, 0];
        } 
        else 
        {
            var t = Math.min(1,(currTime - this.startTime)/2000);
            var easing = easeInOutCubic(t);
            this.position = [easing*this.delta[0],arc(t)*this.delta[1],easing*this.delta[2]];
            if (t == 1)
            {
                this.running = false;
                if (this.finishedHandler)
                    this.finishedHandler();
            }
        }
    }
}

// Função que aplica as transformações da animação
CapturedAnimation.prototype.apply = function() {
    if (this.position) 
    {
        this.scene.translate.apply(this.scene, this.position);
    } 
    else 
    {
        this.scene.rotate(this.rotation, 0, 1, 0);
    }
}
