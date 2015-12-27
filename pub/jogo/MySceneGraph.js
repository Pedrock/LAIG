
function MySceneGraph(filename, scene) {
    this.loadedOk = null ;
    
    // Referencias bidirecionais entre cena e grafo
    this.scene = scene;
    scene.graph = this;
    
    // Leitor de ficheiro XML
    this.reader = new CGFXMLreader();
       
    this.scene.path = "scenes/" + filename.substring(0, filename.lastIndexOf("/") + 1); // Caminho para o ficheiro LSX
    this.reader.open('scenes/' + filename, this); // Abertura do ficheiro
    
    // "Hash maps" para os vários elementos
    this.initials = {};
    this.illumination = {};
    this.lights = {};
    this.materials = {};
    this.textures = {};
    this.animations = {};
    this.nodes = {};
    this.leaves = {};
    this.rootNodeId = undefined; // ID do nó de raiz
    
    // Alteração do getInteger e getFloat da biblioteca
    this.reader.getInteger = function(a, b, c) {
        if (c == undefined)
            c = true;
        var d = this.getString(a, b, c);
        if (d == null )
            return null ;
        return MySceneGraph.parseInt(d);
    };
    this.reader.getFloat = function(a, b, c) {
        if (c == undefined)
            c = true;
        var d = this.getString(a, b, c);
        if (d == null )
            return null ;
        return MySceneGraph.parseFloat(d);
    };
};

/*
 * Função para converter de string para float, com várias verificações
 */
MySceneGraph.parseFloat = function(value, throw_on_error) {
    var regex = /^[-\+]?\d*(?:[.]\d+?)?$/;
    if (!regex.test(value)) value = null;
    if (value != null) {
        value = parseFloat(value);
        value = isNaN(value) ? null : value;
    }
    if (throw_on_error && value === null) throw "Invalid float";
    else return value;
};

/*
 * Função para converter de string para integer, com várias verificações
 */
MySceneGraph.parseInt = function(value, throw_on_error) {
    var regex = /^[-\+]?\d+$/;
    if (!regex.test(value)) value = null;
    var intValue = null;
    if (value != null)
    {
        intValue = parseInt(value);
        if (parseFloat(value) != intValue || isNaN(intValue)) intValue = null;
    }
    if (throw_on_error && intValue === null) throw "Invalid int";
    else return intValue;
};

/*
 * Obtém os sub-elementos de um elemento com uma determinada tag
 */
function getChildrenByTagName(parent, name) 
{
    var result = [];
    for (var i = 0; i < parent.childNodes.length; i++) 
    {
        if (parent.childNodes[i].nodeName.toLowerCase() === name.toLowerCase())
            result.push(parent.childNodes[i]);
    }
    return result;
};

/*
 *  Verifica a ordem dos sub-elementos e existencia de elementos inválidos, dando warnings quando são encontradas incorreções
 */
function checkChildren(element, tags, empty_tags, ignore_order_tags) 
{
    var error = false;
    var prev = -1;
    for (var i = 0; i < element.childNodes.length; i++)
    {
        if (element.childNodes[i].nodeType != 1) 
            continue; // Ignora o childNode se não for um elemento (pode ser comentário ou outro)
        var child = element.childNodes[i].nodeName;
        var index = -1;
        var expected = "";
        for (var j = 0; j < tags.length; j++) 
        {
            if (child.toLowerCase() == tags[j].toLowerCase()) 
            {
                index = j;
                expected = tags[j];
                break;
            }
        }
        if (ignore_order_tags && ignore_order_tags.indexOf(expected) != -1)
            index = prev;
        if (index != -1 && child != tags[j]) 
        {
            console.warn("Tag '" + tags[j] + "' not according to specification. Expected: '" + expected + "'.");
        } 
        else if (index == -1) 
        {
            if (child == "parsererror")
            {
                var errors = element.childNodes[i].childNodes;
                var error = "The LSX contains the following errors:";
                for (var k = 0; k < errors.length; k++)
                {
                    if (errors[k].nodeName != "h3") error += '\n-> ' + errors[k].innerHTML;
                }
                throw error;
            }
            else console.warn("Unknown tag '" + child + "' inside '" + element.nodeName + "'.");
        }
        if (index != -1) 
        {
            if (!error && index < prev) 
            {
                error = true;
                console.warn("Elements out of order in tag '" + element.nodeName + "'.");
            }
            prev = index;
            if (empty_tags && empty_tags[j] && element.childNodes[i].childNodes.length > 0)
                console.warn("Unexpected children in tag '" + child + "' inside '" + element.nodeName + "'.");
        }
    }
};


/*
 * Função chamada depois de aberto o XML
 */
MySceneGraph.prototype.onXMLReady = function() 
{
    console.log("XML Loading finished.");
    //validateXML(this.reader.xmlDoc);
    var rootElement = this.reader.xmlDoc.documentElement;
    if (rootElement.nodeName != "SCENE") 
    {
        console.warn("Root element with 'SCENE' tag expected.");
    }
    
    // Chamadas para funções de parsing dos vários blocos
    try 
    {
        checkChildren(rootElement, ["INITIALS", "ILLUMINATION", "LIGHTS", "TEXTURES", "MATERIALS", "ANIMATIONS", "LEAVES", "NODES"]);
        this.parseInitials(rootElement);
        this.parseIlumination(rootElement);
        this.parseLights(rootElement);
        this.parseTextures(rootElement);
        this.parseMaterials(rootElement);
        this.parseAnimations(rootElement);
        this.parseLeaves(rootElement);
        this.parseNodes(rootElement);
        if (this.rootNodeId && this.nodes[this.rootNodeId]) 
        {
            this.buildObjects(this.rootNodeId, null);
        } 
        else if (this.rootNodeId === undefined) 
        {
            console.error("Invalid root node id.");
        }
        this.loadedOk = true;
    } 
    catch (error) 
    {
        this.onXMLError(error);
        return;
    }
    
    // "Avisar"" a cena de que o grafo foi carregado
    this.scene.onGraphLoaded();
};

/*
 *Função para parsing das animações lineares
 */
MySceneGraph.prototype.parseLinearAnimations = function(animationElement, id, span) {
    checkChildren(animationElement, ["controlpoint"], [true]);

    var controlPoints = this.parseAll("Animations","controlpoint",animationElement,"ANIMATION", id, "Control point ignored", ["xx","yy","zz"], ["getFloat", "getFloat", "getFloat"]);    
    this.animations[id] = new LinearAnimation(this.scene, span, controlPoints);

}


/*
 *Função para parsing das animações circulares
 */
MySceneGraph.prototype.parseCircularAnimations = function(animationElement, id, span) {
    
    var args = this.parseElement(animationElement, ["center", "radius", "startang", "rotang"], ["getString", "getFloat", "getFloat", "getFloat"]);
    if (args == null)
    {
         console.warn("Animations: Invalid animation, id '" + id + "'. Animation ignored.")
         return;
    }
    var center = args[0].match(/\S+/g);
    try
    {
         for (var k = 0; k < center.length; k++)
         {
             center[k] = MySceneGraph.parseFloat(center[k]);
             if (center[k] == null) throw "Invalid center";
         }
    }
    catch (err)
    {
        console.warn("Animations: Invalid animation center, id '" + id + "'. Animation ignored.")
        return;
    }
    this.animations[id] = new CircularAnimation(this.scene,span,center,args[1],args[2],args[3]);
}


/*
 *Função para parsing do bloco ANIMATIONS
 */
MySceneGraph.prototype.parseAnimations = function(rootElement) {
    var elem = this.findFirst('ANIMATIONS', rootElement);
    checkChildren(elem, ["ANIMATION"]);
    var animations = getChildrenByTagName(elem, 'ANIMATION');

    for(var i = 0; i < animations.length;i++)
    {
        var id = this.reader.getString(animations[i], "id", false);
        if (id === null ) 
        {
            console.error("Animation: Invalid animation id. Animation ignored.");
            continue;
        }
        if (this.animations[id])
        {
            console.warn("Animations: Repeated animation id '" + id + "'. Animation ignored.");
            continue;
        }
        var span = this.reader.getFloat(animations[i], "span", false);
        if(span === null)
        {
            console.error("Animation: Invalid animation span. Animation ignored.");
            continue;
        }
        var type = this.reader.getString(animations[i],"type",false);
        if (type != "linear" && type != "circular") 
        {
            console.warn("Animation: Invalid animation type. Animation ignored.");
            continue;
        }

        else if(type == "linear"){
            this.parseLinearAnimations(animations[i],id,span);
        }
        else if(type == "circular"){
            this.parseCircularAnimations(animations[i],id,span);
        }
    }
}


/*
 * Função para parsing do bloco NODES
 */
MySceneGraph.prototype.parseNodes = function(rootElement) {
    var title = "Nodes";
    var elem = this.findFirst('NODES', rootElement);
    checkChildren(elem, ["ROOT", "NODE"], [true, false]);
    
    var root = this.findFirst('ROOT', elem, true);
    if (root != null ) 
    {
        this.rootNodeId = this.reader.getString(root, "id", true);
    } 
    else 
    {
        if (elem.childNodes.length > 0)
            console.warn("Assuming root is the first node.");
    }
    
    var nodes = getChildrenByTagName(elem, 'NODE');
    
    for (var i = 0; i < nodes.length; i++) 
    {
        checkChildren(
        nodes[i], 
        ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "DESCENDANTS","ANIMATIONS"], 
        [true, true, true, true, true, false, false], 
        ["TRANSLATION", "ROTATION", "SCALE","ANIMATIONS"]);
        var id = this.reader.getString(nodes[i], "id", false);
        if (id == null ) 
        {
            console.error("Nodes: Invalid node id found (node number " + (i+1) +  "). Node ignored.");
            continue;
        }
        if (this.nodes[id])
        {
            console.warn("Nodes: Repeated node id '" + id + "'. Node ignored.");
            continue;
        }
        
        var material = this.parseFirst(title, "MATERIAL", nodes[i], "node", id, " Assuming 'null'", ["id"], ["getString"], false, ["null"])[0];
        var texture = this.parseFirst(title, "TEXTURE", nodes[i], "node", id, " Assuming 'null'", ["id"], ["getString"], false, ["null"])[0];
        
        var node = new Node(this.scene,id,material,texture);
        
        var subElements = nodes[i].childNodes;
        var count = 0;
        for (var k = 0; k < subElements.length; k++) 
        {
            try {
                var elem = subElements[k];
                switch (elem.nodeName) 
                {
                case "TRANSLATION":
                    count++;
                    var args = this.parseElement(elem, ["x", "y", "z"], ["getFloat", "getFloat", "getFloat"]);
                    if (args == null )
                        throw "invalid";
                    node.transformations.push(new Translation(args[0],args[1],args[2]));
                    break;
                case "ROTATION":
                    count++;
                    var axis = this.reader.getItem(elem, "axis", ['x', 'y', 'z'], false);
                    var angle = this.reader.getFloat(elem, "angle", false);
                    if (axis == null  || angle == null )
                        throw "invalid";
                    node.transformations.push(new Rotation(axis,angle));
                    break;
                case "SCALE":
                    count++;
                    var args = this.parseElement(elem, ["sx", "sy", "sz"], ["getFloat", "getFloat", "getFloat"]);
                    if (args == null )
                        throw "invalid";
                    node.transformations.push(new Scaling(args[0],args[1],args[2]));
                    break;
                case "MATERIAL":
                case "TEXTURE":
                case "DESCENDANTS":
                case "ANIMATIONS":
                    break;
                default:
                    if (elem.nodeType == 1)
                        console.warn("Invalid node tag '" + elem.nodeName + "' (node id = '" + id + "').");
                    break;
                }
            } catch (error) {
                console.error("Error while processing node transformation (node id = '" + id + "', transformation number " + count + ").");
            }
        }
        
        var descendantsContainer = getChildrenByTagName(nodes[i], 'DESCENDANTS');
        if (descendantsContainer.length > 0) {
            if (descendantsContainer.length > 1)
                console.warn("Nodes: Multiple 'descendants' elements found (node id = '" + id + "'). Using first one.");
            checkChildren(descendantsContainer[0], ["DESCENDANT"], [true]);
            node.descendants = this.parseAll(title, "DESCENDANT", descendantsContainer[0], "node", id, "Descendent ignored", ["id"], ["getString"]);
            this.nodes[id] = node;
            if (this.rootNodeId === undefined)
                this.rootNodeId = id;
        } 
        else if (descendantsContainer.length == 0) 
        {
            console.warn("Nodes: No 'descendants' element found (node id = '" + id + "'). Node ignored.");
        }

        var animationsContainer = getChildrenByTagName(nodes[i], 'ANIMATIONS');
        if (animationsContainer.length > 0) {
            if (animationsContainer.length > 1)
                console.warn("Nodes: Multiple 'ANIMATIONS' elements found (node id = '" + id + "'). Using first one.");
            checkChildren(animationsContainer[0], ["ANIMATION"], [true]);
            var animations = this.parseAll(title, "ANIMATION", animationsContainer[0], "node", id, "Animation ignored", ["id"], ["getString"]);
            for (var k in animations)
            {
                this.nodes[id].addAnimation(animations[k]);
            }
        }
    }
}

/*
 * Função para parsing do bloco LEAVES
 */
MySceneGraph.prototype.parseLeaves = function(rootElement) {
    
    var elem = this.findFirst('LEAVES', rootElement);
    checkChildren(elem, ["LEAF"]);
    var leaves = getChildrenByTagName(elem, 'LEAF');
    
    for (var i = 0; i < leaves.length; i++) 
    {
        var attributes = {};
        for (var j = 0; j < leaves[i].attributes.length; j++)
        {
            var attr = leaves[i].attributes[j].name;
            attributes[attr] = leaves[i].attributes[j].value;
        }
        if (attributes.id == null ) 
        {
            console.error("Leaves: Invalid leaf id. Leaf ignored.");
            continue;
        }
        if (this.nodes[attributes.id])
        {
            console.warn("Nodes: Repeated node/leaf id '" + attributes.id + "'. Leaf ignored.");
            continue;
        }
        if (attributes.type == null ) 
        {
            console.error("Leaves: Invalid leaf type. Leaf ignored.");
            continue;
        }
       
        this.nodes[attributes.id] = new Leaf(this.scene,attributes);
        if (attributes.type == "patch")
        {
            var points = this.parseAll("Patch Control Points", "controlpoint", leaves[i], "Leave" , attributes.id , "Control point ignored", ["x", "y", "z"], ["getFloat", "getFloat", "getFloat"]);
            this.nodes[attributes.id].controlPoints = points;
        }
    }
}
 
/*
 * Função para parsing do bloco INITIALS
 */
MySceneGraph.prototype.parseInitials = function(rootElement) {
    var title = "Initials";
    var initials = this.findFirst('INITIALS', rootElement);
    checkChildren(initials, ["frustum", "translation", "rotation", "scale", "reference"], [true, true, true, true, true]);
    
    var frustum = getChildrenByTagName(initials, 'frustum');
    if (frustum.length > 1) {
        console.warn("Initials: Multiple 'frustum' elements found. Using first one.");
    } 
    else if (frustum.length == 0) 
    {
        console.warn("Initials: No 'frustum' element found. Assuming default values.");
    }
    this.initials.frustum = {};
    
    if (frustum.length > 0)
        this.initials.frustum.near = this.reader.getFloat(frustum[0], "near", false);
    
    if (this.initials.frustum.near == null ) 
    {
        this.initials.frustum.near = 0.1;
        if (frustum.length > 0)
            console.warn("Initials: Frustum near value not found, defaulting to " + this.initials.frustum.near);
    }
    if (frustum.length > 0)
        this.initials.frustum.far = this.reader.getFloat(frustum[0], "far", false);
    if (this.initials.frustum.far == null ) 
    {
        this.initials.frustum.far = 500;
        if (frustum.length > 0)
            console.warn("Initials: Frustum far value not found, defaulting to " + this.initials.frustum.far);
    }
    
    this.initials.translations = this.parseAll(title, "translation", initials, null , null , "Translation ignored", ["x", "y", "z"], ["getFloat", "getFloat", "getFloat"], 1);
    
    var rotations = getChildrenByTagName(initials, 'rotation');
    if (rotations.length != 3) {
        console.warn("Initials: Either less or more than three 'rotation' elements found.");
    }
    this.initials.rotations = [];
    for (var i = 0; i < rotations.length; i++) 
    {
        var axis = this.reader.getItem(rotations[i], 'axis', ['x', 'y', 'z'], false);
        var angle = this.reader.getFloat(rotations[i], 'angle', false);
        if (axis == null  || angle == null ) {
            console.warn("Initials: Invalid initial rotation. Rotation ignored.");
        } 
        else
            this.initials.rotations.push({
                'axis': axis,
                'angle': Math.PI * angle / 180
            });
    }
    
    this.initials.scalings = this.parseAll(title, "scale", initials, null , null , "Scaling ignored", ["sx", "sy", "sz"], ["getFloat", "getFloat", "getFloat"], 1);
    this.initials.referenceLength = this.parseFirst(title, "reference", initials, null , null , "Assuming default values", ["length"], ["getFloat"], false, [5])[0];
};


/*
 * Função para parsing do bloco ILUMINATION
 */
MySceneGraph.prototype.parseIlumination = function(rootElement) {
    var title = "Illumination";
    var illumination = this.findFirst('ILLUMINATION', rootElement);
    checkChildren(illumination, ["ambient", "background"], [true, true]);
    this.illumination.ambient = this.parseFirst(title, "ambient", illumination, null , null , "Assuming default values", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0.5, 0.5, 0.5, 1]);
    this.illumination.background = this.parseFirst(title, "background", illumination, null , null , "Assuming default values", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [1, 1, 1, 1]);
};


/*
 * Função para parsing do bloco LIGHTS
 */
MySceneGraph.prototype.parseLights = function(rootElement) {
    var title = "Lights";
    var elem = this.findFirst('LIGHTS', rootElement);
    checkChildren(elem, ["LIGHT"]);
    var lights = getChildrenByTagName(elem, 'LIGHT');
    
    for (var i = 0; i < lights.length; i++) 
    {
        checkChildren(lights[i], ["enable", "position", "ambient", "diffuse", "specular"], [true, true, true, true, true]);
        var id = this.reader.getString(lights[i], "id", false);
        if (id == null ) 
        {
            console.error("Lights: Invalid light id. Light ignored.");
            continue;
        }
        if (this.lights[id])
        {
            console.warn("Lights: Repeated light id '" + id + "'. Light ignored.");
            continue;
        }

        var enabled = this.parseFirst(title, "enable", lights[i], "light", id, "Assuming as enabled", ["value"], ["getBoolean"], false, [true])[0];
        var position = this.parseFirst(title, "position", lights[i], "light", id, "Light ignored", ["x", "y", "z", "w"], ["getFloat", "getFloat", "getFloat", "getFloat"], true);
        if (position == null )
            continue;
        var ambient = this.parseFirst(title, "ambient", lights[i], "light", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        var diffuse = this.parseFirst(title, "diffuse", lights[i], "light", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        var specular = this.parseFirst(title, "specular", lights[i], "light", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        
        this.lights[id] = new Light(this.scene,enabled,position,ambient,diffuse,specular)
    }
};


/*
 * Função para parsing do bloco MATERIALS
 */
MySceneGraph.prototype.parseMaterials = function(rootElement) {
    var title = "Materials";
    var elem = this.findFirst('MATERIALS', rootElement);
    
    var materials = getChildrenByTagName(elem, 'MATERIAL');
    
    for (var i = 0; i < materials.length; i++) 
    {
        checkChildren(materials[i], ["shininess", "specular", "diffuse", "ambient", "emission"], [true, true, true, true, true]);
        var id = this.reader.getString(materials[i], "id", false);
        if (id == null ) 
        {
            console.error("Materials: Invalid material id. Material ignored.");
            continue;
        }
        if (this.materials[id])
        {
            console.warn("Materials: Repeated material id '" + id + "'. Material ignored.");
            continue;
        }
        
        var shininess = this.parseFirst(title, "shininess", materials[i], "material", id, "Assuming as 1", ["value"], ["getFloat"], false, [1])[0];
        var ambient = this.parseFirst(title, "ambient", materials[i], "material", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        var diffuse = this.parseFirst(title, "diffuse", materials[i], "material", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        var specular = this.parseFirst(title, "specular", materials[i], "material", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        var emission = this.parseFirst(title, "emission", materials[i], "material", id, "Assuming as zero", ["r", "g", "b", "a"], ["getFloat", "getFloat", "getFloat", "getFloat"], false, [0, 0, 0, 0]);
        
        this.materials[id] = new Material(this.scene,shininess,specular,diffuse,ambient,emission);
    }
};


/*
 * Função para parsing do bloco TEXTURES
 */
MySceneGraph.prototype.parseTextures = function(rootElement) {
    var title = "Textures";
    var elem = this.findFirst('TEXTURES', rootElement);
    checkChildren(elem, ["TEXTURE"]);
    
    var textures = getChildrenByTagName(elem, 'TEXTURE');
    
    for (var i = 0; i < textures.length; i++) 
    {
        checkChildren(textures[i], ["file", "amplif_factor"], [true, true]);
        var id = this.reader.getString(textures[i], "id", false);
        if (id == null ) 
        {
            console.error("Textures: Invalid texture id. Texture ignored.");
            continue;
        }
        if (this.textures[id])
        {
            console.warn("Textures: Repeated texture id '" + id + "'. Texture ignored.");
            continue;
        }
        
        var file = this.parseFirst(title, "file", textures[i], "texture", id, "Texture ignored", ["path"], ["getString"], true);
        if (file == null )
            continue;
        var amplif_factor = this.parseFirst(title, "amplif_factor", textures[i], "texture", id, "Assuming default values", ["s", "t"], ["getFloat", "getFloat"], false, [1, 1]);
        
        file = this.scene.path + file;
        this.textures[id] = new CGFtexture(this.scene,file);
        this.textures[id].amplif_factor = amplif_factor;
    }
}
;

/*
 * Função que procura o primeiro sub-elemento com o id element_name no elemento parent_element.
 * Imprime um erro se nenhum for encontrado, ou um warning se for encontrado mais do que um.
 */
MySceneGraph.prototype.findFirst = function(element_name, parent_element, required) 
{
    var elems = getChildrenByTagName(parent_element, element_name);
    if (elems.length == 0) {
        console.error("No '" + element_name + "' element found.");
        if (required)
            return null ;
        else
            return document.createElement(element_name);
    } 
    else if (elems.length > 1) {
        console.warn("Multiple '" + element_name + "' elements found. Using first one.");
    }
    return elems[0];
}

/*
 * Função que faz parsing de todos os sub-elementos com id element_name no elemento parent_element. Retorna uma lista com os resultados.
 * Imprime warnings em caso de erro, ou caso expected_number seja indicado e o número de elementos encontrados seja diferente do esperado.
 */
MySceneGraph.prototype.parseAll = function(title, element_name, parent_element, parent_name, parent_id, error_message, values, reader_functions, expected_number) 
{
    var elements = getChildrenByTagName(parent_element, element_name);
    if (expected_number && elements.length != expected_number)
        console.warn(title + ": Unexpected number of '" + element_name + "' elements found" + (parent_id != null  ? " (" + parent_name + " id='" + parent_id + "')" : "") + ".");
    var results = [];
    for (var i = 0; i < elements.length; i++) 
    {
        var result = this.parseElement(elements[i], values, reader_functions);
        if (result == null )
            console.warn(title + ": Invalid '" + element_name + "' value" + (parent_id != null  ? " (" + parent_name + " id='" + parent_id + "')" : "") + ". " + error_message + ".");
        else 
        {
            if (result.length == 1)
                results.push(result[0]);
            else
                results.push(result);
        }
    }
    return results;
}

/*
 * Faz parsing do primeiro sub-elemento com id element_name no elemento parent_element e retorna o resultado.
 * Imprime um erro se nenhum for encontrado, ou um warning se for encontrado mais do que um.
 */
MySceneGraph.prototype.parseFirst = function(title, element_name, parent_element, parent_name, parent_id, error_message, values, reader_functions, required, defaults) 
{
    var elements = getChildrenByTagName(parent_element, element_name);
    var result = null ;
    if (elements.length == 0) {
        console.warn(title + ": No '" + element_name + "' element found" + (parent_id != null  ? " (" + parent_name + " id='" + parent_id + "')" : "") + ". " + error_message + ".");
        if (!required)
            return defaults;
    } 
    else 
    {
        if (elements.length > 1)
            console.warn(title + ": Multiple '" + element_name + "' elements found" + (parent_id != null  ? " (" + parent_name + " id='" + parent_id + "')" : "") + ". Using first one.");
        result = this.parseElement(elements[0], values, reader_functions);
        if (result == null )
            console.warn(title + ": Invalid '" + element_name + "' value" + (parent_id != null  ? " (" + parent_name + " id='" + parent_id + "')" : "") + ". " + error_message + ".");
    }
    if (result != null  || required)
        return result;
    else
        return defaults;
}

/*
 * Faz parsing de um dado elemento, para dados valores (values) e com determinadas funções do CGFXMLreader (reader_functions) através de reflection
 */
MySceneGraph.prototype.parseElement = function(element, values, reader_functions) 
{
    try 
    {
        var result = [];
        for (var i = 0; i < values.length; i++) 
        {
            var value = this.reader[reader_functions[i]](element, values[i], false);
            if (value == null )
                return null ;
            result.push(value);
        }
        return result;
    } 
    catch (error) 
    {
        return null ;
    }
}

/*
 * Constrói os objetos da cena e remove folhas, nós, texturas e materiais inválidos.
 */
MySceneGraph.prototype.buildObjects = function(id, texture) 
{
    var node = this.nodes[id];
    if (texture == null) texture = node.texture;
    if (this.nodes[id].isLeaf) 
    {
        var amplif_factor = [1, 1];
        if (texture != "clear" && texture != "null" && this.textures[texture] != null ) 
        {
            amplif_factor = this.textures[texture].amplif_factor;
        }
        node.build(amplif_factor);
    } 
    else 
    {
        node.createTransformationsMatrix();
        for (var i = 0; i < node.descendants.length; i++) 
        {
            var desc_id = node.descendants[i];
            if (this.nodes[desc_id] == null ) 
            {
                console.warn("Invalid node/leaf id in use: '" + desc_id + "'.");
                node.descendants[i] = null ;
                continue;
            }
            var texture2 = texture;
            if (node.texture != "clear" && node.texture != "null" && this.textures[node.texture] == null ) 
            {
                console.warn("Invalid texture id in use: '" + node.texture + "'.");
                node.texture = "clear";
            }
            if (node.material != "null" && this.materials[node.material] == null ) 
            {
                console.warn("Invalid material id in use: '" + node.material + "'.");
                node.material = "null";
            }
            if (node.texture != "null")
                texture2 = node.texture;
            this.buildObjects(node.descendants[i], texture2);
        }
        node.descendants = node.descendants.filter(function(e) { return e});
    }
}


/*
 * Função chamada em caso de erro
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};