function Leaf(scene, attributes) {
    this.scene = scene;
    this.isLeaf = true;
    this.objects = {}; // One object per amplif_factor
    this.error = false;
    for (var attr in attributes)
    {
        this[attr] = attributes[attr];
    }
    this.use_amplif_factor = false;
}

Leaf.prototype.display = function(material, texture) 
{
    var scene = this.scene;
    if (material != "null") 
    {
        scene.graph.materials[material].apply();
    }
    var amplif_factor = [1, 1];
    if (texture == "clear") 
    {
        if (scene.currentTexture) {
            scene.graph.textures[scene.currentTexture].unbind();
            scene.currentTexture = null ;
        }
    }
    else
    {
        scene.graph.textures[texture].bind()
        amplif_factor = scene.graph.textures[texture].amplif_factor;
        scene.currentTexture = texture;
    }
    if (!this.use_amplif_factor) amplif_factor = 0;
    var object = this.objects[amplif_factor];
    if (object) object.display();
}

Leaf.prototype.build = function(amplif_factor)
{
    if (this.objects[amplif_factor] === undefined)
    {
        try 
        {
            var parseFloat = function(value){ return MySceneGraph.parseFloat(value,true)};
            var parseInt = function(value){ return MySceneGraph.parseInt(value,true)};
            if (this.args) var args = this.args.match(/\S+/g);
            switch (this.type.toLowerCase()) 
            {
            case "rectangle":
                if (args.length != 4)
                    throw "Invalid args";
                var argsf = [[], []];
                for (var k = 0; k < args.length; k++)
                    argsf[~~(k/2)].push(parseFloat(args[k]));
                this.objects[amplif_factor] = new Rectangle(this.scene,argsf[0],argsf[1],amplif_factor);
                this.use_amplif_factor = true;
                break;
            case "cylinder":
                if (args.length != 5)
                    throw "Invalid args";
                this.objects[amplif_factor] = new Cylinder(this.scene,parseFloat(args[0]),parseFloat(args[1]),parseFloat(args[2]),parseInt(args[3]),parseInt(args[4]),amplif_factor);
                this.use_amplif_factor = true;
                break;
            case "sphere":
                if (args.length != 3)
                    throw "Invalid args";
                this.objects[amplif_factor] = new Sphere(this.scene,parseFloat(args[0]),parseInt(args[1]),parseInt(args[2]),amplif_factor);
                this.use_amplif_factor = true;
                break;
            case "triangle":
                if (args.length != 9)
                    throw "Invalid args";
                var argsf = [[], [], []];
                for (var k = 0; k < args.length; k++)
                    argsf[~~(k/3)].push(parseFloat(args[k]));
                this.objects[amplif_factor] = new Triangle(this.scene,argsf[0],argsf[1],argsf[2],amplif_factor);
                this.use_amplif_factor = true;
                break;
            case "plane":
                if (!this.parts)
                    throw "Invalid args";
                this.objects[0] = new Plane(this.scene,parseInt(this.parts));
                break;
            case "patch":
                 if (!this.order || !this.partsU || !this.partsV || this.controlPoints.length < 4)
                    throw "Invalid args";
                this.objects[0] = new Patch(this.scene,parseInt(this.order), parseInt(this.partsU), parseInt(this.partsV), this.controlPoints);
                break;
            case "vehicle":
                if (args)
                    throw "Invalid args";
                this.objects[0] = new Vehicle(this.scene);
                break;
            case "terrain":
                if (!this.texture || !this.heightmap)
                    throw "Invalid args";
                this.objects[0] = new Terrain(this.scene,this.texture,this.heightmap);
                break;
            case "board":
                this.objects[0] = new Board(this.scene);
                break;
            default:
               if (!this.error) console.error("Leaves: Invalid leaf type: '" + type + "'. Leaf ignored.");
               return;
            }
        } 
        catch (error) 
        {
            if (!this.error) console.error("Error while processing leaf with id '" + this.id + "'. Leaf ignored.");
            this.error = true;
            return;
        }
    }
}