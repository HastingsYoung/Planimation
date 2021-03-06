/**The input domain text file
 * @global
 */
var Domain_file;
/**The input problem text file
 * @global
 */
var Problem_file;
/**The input plan text file
 * @global
 */
var Plan_file;

/**Global store of parsed predicates
 * @global
 */
var predicates;

/**Global store of parsed predicates as and assosciative array. This
is simply a transformation of the global predicates value intended to
simplify and speed up lookup based on a predicates name
 * @global
 */
var aa_predicates = {};
/**Global store of parsed objects
 * @global
 */
var objects;
/**Global store of parsed constants
 * @global
 */
var constants;
/**Global store of parsed preconditions
 * @global
 */
var types;
/**Global store of parsed Actions
 * @global
 */
var actions;

/*----------------------------------------------------------------------------|
#SECTION 0.1                       Load Files
|----------------------------------------------------------------------------*/

$(document).ready(function() {

    $('#inputdomain').on('change', function(e) {
        domain_file = this.files[0];
    });

    $('#inputproblem').on('change', function(e) {
        problem_file = this.files[0];
    });

    $('#inputplan').on('change', function(e) {
        plan_file = this.files[0];
    });

    $('#loadbutton').on('change', function(e) {
        parseSavedFile(this.files[0]);
    });

});

function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = callback;
    reader.readAsText(file);
}

/*----------------------------------------------------------------------------|
#SECTION 0.2                  Parse Loaded Files
|----------------------------------------------------------------------------*/

/**Parses the loaded plan and returns a list of actions
 *@param {array} domain - Objects from parsed domain file. [preconditions, constants, predicates, actionList]
 *@param {array} problem - Objects from the parsed problem file. [objects, startPredicates]
 *@param {function} callback - the function that will run on the parsed files.
 */
function parseSolution(domain, problem, callback) {
    readFile(plan_file, function(e) {
        try {
            plan = null;
            plan = Plan_Parser.parse(e.target.result);
            console.log(plan);

        } catch (x) {
            console.log(x);
        } finally {
            callback(domain, problem, plan);
        }
    });
}

/**Parses the loaded problem and returns lists of objects
NOTE: Sometimes has problems if the file ends in an RPAREN,
I think the parser misses the EOF token when this is the case, adding a
whitespace character at the end seems to fix it. Could be some weird
CRLF v LF based bug, but I've consciously covered both line endings in
the parser
  *@param {array} domain - Objects from parsed domain file. [preconditions, constants, predicates, actionList]
  *@param {function} callback - the function that will run on the parsed files.
  */
function parseProblem(domain, callback) {
    readFile(problem_file, function(e) {
        try {
            problem = null;
            problem = PDDL_Parser.parse(e.target.result);
            console.log(problem);

        } catch (x) {
            console.log(x);
        } finally {
            return parseSolution(domain, problem, callback);
        }
    });
}

/**Parses the loaded domain file and returns lists of objects in the form
[preconditions, constants, predicates, actionList]
 *@param {function} callback - the function that will run on the parsed files.
 */
function parseDomain(callback) {
    readFile(domain_file, function(e) {
        try {
            domain = null;
            domain = PDDL_Parser.parse(e.target.result);
            console.log(domain);

        } catch (x) {
            console.log(x);
        } finally {
            parseProblem(domain, callback);
        }
    });
}

/**
 * Parse the input files and generate the input window
 */
function parseInputFiles() {
    parseDomain(generateInputWindow);
}

/*----------------------------------------------------------------------------|
#SECTION 0.3            Generate the Selected Window
|----------------------------------------------------------------------------*/
/**
 *
 This function is passed as a callbasck to
 parseDomain becasue FileReader runs ASYNC and I need to ensure files are parsed
 before the rest of the script is exectured
 *@param {array} domain - Objects from parsed domain file. [preconditions, constants, predicates, actionList]
 *@param {array} problem - Objects from the parsed problem file. [objects, startPredicates]
 *@param {array} plan - Objects from parsed plan file. [actions]
 */
function generateInputWindow(domain, problem, plan) {

    //set the globals
    types = domain[0];
    constants = domain[1];
    predicates = domain[2];
    for (var i = 0; i < predicates.length; i++) {
        aa_predicates[predicates[i].name] = predicates[i];
    }
    objects = problem[0];
    actions = domain[3];

    var inputSelector = createInputSelector();

    //Switch to the input window
    document.getElementById("Window1").style.display = "none";
    document.getElementById("Window2").style.display = "block";

    //Generate the objects that will store user input
    createAnimationObjects();

    //generate the timeline of possible animations based on the input plan
    generateAnimationTimeline(predicates, problem, plan);

    //populate the input selector and generate the initial input form
    $("#inputSelector").append(inputSelector);
    generateInputForm();

}

/**
 * Switch the webpage to the animation and generate the animation states
 */
function switchToAnimationWindow() {
    document.getElementById("Window2").style.display = "none";
    document.getElementById("Window3").style.display = "block";
    createInitialStage();

    console.log(animationTimeline);
    addStatesToAnimationEntities();
}

/**
 * Switch from the animation stage to the Input Option screen
 */
function switchToInputWindow() {
    $("#Window3").html("");
    document.getElementById("Window3").style.display = "none";
    document.getElementById("Window2").style.display = "block";
    // Clear pending animations
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
}

/*----------------------------------------------------------------------------|
#SECTION 1.0                    Animation Objects
|----------------------------------------------------------------------------*/

/**
 * Options for the entire animation.
 * used to store the stage dimensions.
 * @global
 */
var globalOptions = new GlobalOption("%");

/**
 * Used to store options specified on preconditions as an assosciative array
 * for fast lookup.
 * @global
 */
var typeOptions = {};
/**
 * Used to store options specified on objects as an assosciative array
 * for fast lookup.
 * @global
 */
var initialObjectProperties = {};
/**
 * Used to store options specified on objects as an assosciative array
 * for fast lookup.
 * @global
 */
var objectProperties = {};
/**
 * Used to store options specified on predicates as an assosciative array
 * for fast lookup. For predicates, each key points to a list of objects of
 * type predicateOption.
 * @global
 */
var predicateOptions = {};

/**
 * Used to store options specified on actions as an assosciative array
 * @global
 */
var actionOptions = {};

/**
 * Store options that will be applied as default to all objects of the
 * corresponding type.
 *  @constructor
 */
function TypeOption(name, image, css, layout, size) {
    this.name = name;
    this.image = image;
    this.css = css;
    this.layout = layout;
    this.size = size;
}

/**
 * Store options that define global parameters such as the stage dimensions
 * @param {array} stageDimensions - The dimensions of the animation stage in pixels
 *  @constructor
 */
function GlobalOption(units) {
    this.units = units;
    this.labelled = "false";
}


/**
 * Store options that will be applied to an object
 *  @constructor
    @param {string} name - The object's name
    @param {string} type - If typed, the type, else undefined
    @param {string} image - URL of the image to use to represent the object on stage
    @param {array} location - The current coordinates of the object on the stage
    @param {string} css - The transformations to apply by default to the input image
 */
function ObjectProperty(name, type, image, location, css, size) {
    this.name = name;
    this.type = type;
    this.image = image;
    this.location = location;
    this.css = css;
    this.size = size;
    this.custom_js = "";
}

/**
 * Store options that will be applied to an object given a defined predicate outcome
  @param {string} name - The name of the predicate
  @param {boolean} truthiness - Does this apply when the predicate eveluates to true or false
  @param {string} argument1 - The first argument to the predicate
  @param {string} argument1 - The second argument to the predicate
  @param {string} argumentValue - The value taken by the first argument
  @param {AnimeationOption} animation - {image,location,css, transition_image}
 *  @constructor
 */
function PredicateOption(name, truthiness, argument1, argument2, argument1_value, animation) {
    this.name = name.toLowerCase(); //predicate name
    this.truthiness = truthiness;
    this.argument1 = argument1;
    this.argument2 = argument2;
    this.argument1_value = argument1_value;
    this.animation = animation;
}

function ActionOption(predicateOrdering) {
    // array containing the name of the action's predicates in the order they
    // will be animated
    this.predicateOrdering = predicateOrdering;
}

/**
 * Store the changes that will be applied when a predicate option is matched.
 @param {string} image - The URL of the image to swap the object to at the end
 of the predicate's animation sequence.
 @param {string} location - The location (coords or relative) of the applicable
 object.
 @param {string} custom_js - Any custom anime.js actions a user would like to
 specify.
 @param {string} size - The size of the target object.
 @param {string} duration - The duration of the animation (default is 1 second).
 @param {string} transition_image - The URL of the image to display while the
 predicate's animation is in progress.
 */
function AnimationOption(image, location, custom_js, size, duration, transition_image) {
    this.image = image;
    this.location = location;
    this.custom_js = custom_js;
    this.size = size;
    this.duration = duration;
    this.transition_image = transition_image;
}

/**
 * Initializes the input option containers based on the parsed pddl entities
 */
function createAnimationObjects() {
    //Populate initial Action option information
    if (actions != "undefined" && actions.length > 0) {
        for (var i = 0; i < actions[i].length; i++) {
            predicateOrder = [];
            for (var j = 0; j < actions[i].effects.length; j++) {
                predicateOrder.push(actions[i].effects[j].name);
            }
            actionOptions[actions[i].name].predicateOrdering =
                new ActionOption(predicateOrder);
        }
    }

    //Create the assosciative array that will hold lists of option predicates
    if (predicates != "undefined" && predicates.length > 0) {
        for (var i = 0; i < predicates.length; i++) {
            predicateOptions[predicates[i].name.toLowerCase()] = [];
        }
    }

    /*  Ditto for preconditions AND constants/objects that will for the remainder of
        this program be referred to as objects(they 're treated identically)
        It begins by applying the preconditions to each object, which is necessary due
        to the formatting of the parser 's output, then populates the
        assosciative array
    */
    if (types != "undefined" && types.length > 0) {
        for (var i = 0; i < types.length; i++) {
            typeOptions[types[i]] = new TypeOption(types[i]);
        }
        var typeCounter = 0;
        var type = "";
        for (var i = 0; i < constants.names.length; i++) {
            if (i < constants.typeIndex[typeCounter]) {
                type = constants.types[typeCounter];
            } else {
                typeCounter++;
                type = constants.types[typeCounter];
            }
            var name = constants.names[i];
            initialObjectProperties[name] = new ObjectProperty(name, type);
            initialObjectProperties[name].location = [0, 0];
        }
        typeCounter = 0;

        for (var i = 0; i < objects.names.length; i++) {
            if (i < objects.typeIndex[typeCounter]) {
                type = objects.types[typeCounter];
            } else {
                type = objects.types[typeCounter];
                typeCounter++;
            }
            var name = objects.names[i];
            initialObjectProperties[name] = new ObjectProperty(name, type);
            initialObjectProperties[name].location = [0, 0];
        }
    } else {
        for (var i = 0; i < constants.names.length; i++) {
            var name = constants.names[i];
            initialObjectProperties[name] = new ObjectProperty(name);
            initialObjectProperties[name].location = [0, 0];
        }
        for (var i = 0; i < objects.names.length; i++) {
            var name = objects.names[i];
            initialObjectProperties[name] = new ObjectProperty(name);
            initialObjectProperties[name].location = [0, 0];
        }
    }
}

/*----------------------------------------------------------------------------|
#SECTION 2.0               Generate Input Form Selector
|----------------------------------------------------------------------------*/

/**When Load File is selected from the menu, present the file input field and
ensure the event handler is active*/
function loadFileSelector() {
    $("#inputOptions").html(
        "<br><br><br><input id=\"loadbutton\" type=\"file\">");
    $('#loadbutton').on('change', function(e) {
        parseSavedFile(this.files[0]);
    });
}

/**Populate the input selector with all available configurable entities such as
constants, objects, prediucates, actions and preconditions.*/
function createInputSelector() {
    var itemCell = "<td class=\"item\" tabindex=\"0\" onclick=\"selectInput(event);\"";
    var output = "";
    output += "<table id=\"inputTable\"><tbody><tr>" +
        "<td class=\"item\" onclick=\"loadFileSelector();\"" + ">Load Options</td></tr>";

    output += "<tr><td class=\"item\" onclick=\"selectInput(event);\" " +
        "data-type=\"global\">Global Options</td></tr>";

    if (types.length > 0) {
        output += "<tr><td class=\"itemGroup\">Types</td></tr>";
        for (var i = 0; i < types.length; i++) {
            output += "<tr>" + itemCell + "data-type=\"type\">" +
                types[i] + "</td></tr>";
        }
    }

    if (constants.names.length > 0) {
        output += "<tr><td class=\"itemGroup\">Constants</td></tr>";
        for (var i = 0; i < constants.names.length; i++) {
            output += "<tr>" + itemCell + "data-type=\"constant\">" +
                constants.names[i] + "</td></tr>";
        }
    }

    if (objects.names.length > 0) {
        output += "<tr><td class=\"itemGroup\">Objects</td></tr>";
        for (var i = 0; i < objects.names.length; i++) {
            output += "<tr>" + itemCell + "data-type=\"object\">" +
                objects.names[i] + "</td></tr>";
        }
    }


    if (predicates.length > 0) {
        output += "<tr><td class=\"itemGroup\">Predicates</td></tr>";
        for (var i = 0; i < predicates.length; i++) {
            output += "<tr>" + itemCell + "data-type=\"predicate\">" +
                predicates[i].name + "</td></tr>";
        }
    }

    if (actions.length > 0) {
        output += "<tr><td class=\"itemGroup\">Actions</td></tr>";
        for (var i = 0; i < actions.length; i++) {
            output += "<tr>" + itemCell + "data-type=\"action\">" +
                actions[i].name + "</td></tr>";
        }
    }

    output += "</tbody></table>";
    return output;
}

/**Keep track of the currently selected objcet. This facilitates updating the
option's parameters when another is selected so the user doesn't have to trigger
the save/apply function every time they want to record changes.
@constructor
*/
function SelectedInput(name, type) {
    this.name = name;
    this.type = type;
}

/**
 * Keeps track of the object currently selected in the input selector.
 @global
 */
var selectedInput = new SelectedInput('', '');

/**
 * Return an object stored in an array of objects by it's name. Object is used
 here to refer to a JavaScript object, not a PDDL one.
@param {string} name - name of the object
@param {array} collection - one of the the arrays yielded from the parser's output
*/
function getObjectByName(name, collection) {
    for (var i = 0; i < collection.length; i++) {
        if (collection[i].name == name) {
            return collection[i];
        }
    }
}

/*----------------------------------------------------------------------------|
#SECTION 2.1                Generate Input Form
|----------------------------------------------------------------------------*/
/**This is the function that runs when an item from the list of objects/preconditions
is clicked. It loads the available options into the #inputOptions div*/
function selectInput(e) {
    //get the name of the selected option
    var name = e.target.innerHTML;
    var type = e.target.getAttribute('data-type');
    //update the previously selected option's parameters
    if ($("#selectionType").html() != "predicate") {
        updateInputOptionEntity($("#selectionName").html(), $("#selectionType").html());
    }
    //construct the input form
    var form = "";
    form += "<h1 id=\"selectionType\">" + type + "</h1>";
    form += "<h2 id=\"selectionName\">" + name + "</h2>";
    if (type == "object" || type == "constant") {
        if (initialObjectProperties[name].type != "undefined" &&
            typeof(initialObjectProperties[name].type) != "undefined") {
            form += "<h2 id=\"selectionObjectType\">" +
                initialObjectProperties[name].type + "</h2>";
        }

        form += "<p></p>";
    }
    form += generateInputForm(name, type);

    //insert the input form
    $('#inputOptions').html(form);

    //Populate and activate the preview area if the option is a predicate
    if (type == "predicate") {
        $("#previewHeading").html("Existing Options");
        generatePredicateOptionPreview(name);
        var predicate = getObjectByName(name, predicates);
        var argument = $("#arg1").val();
        var argtype;
        if (types.length === 0) {
            $("#objectSelector").html(generateObjectSelector(getObjectListFromType()));
        } else {
            for (var i = 0; i < predicate.parameters.length; i++) {
                if (predicate.parameters[i].name == argument) {
                    argtype = predicate.parameters[i].type;
                }
            }
            $("#objectSelector").html(generateObjectSelector(getObjectListFromType(argtype)));
        }
        /*set event handler to populate argument value options based on the first
        argument selected.*/
        $("#arg1").on('change', function(e) {
            argument = this.value;
            if (types.length === 0) {
                $("#objectSelector").html(generateObjectSelector(getObjectListFromType()));
            } else {
                for (var i = 0; i < predicate.parameters.length; i++) {
                    if (predicate.parameters[i].name == argument) {
                        argtype = predicate.parameters[i].type;
                    }
                }
                $("#objectSelector").html(generateObjectSelector(getObjectListFromType(argtype)));
            }
        });
    } else {
        //TODO
        //If it's not a predicate, global options or load screen,
        //place an image preview based on the input image URL and the css Options
        $("#previewHeading").html("Preview");
        generateObjectPropertyPreview(name, type);
    }

    //Load already saved values into the input form
    //(so that options persist accross selections)
    switch (type) {
        case 'type':
            writeTypeOption(name);
            break;
        case 'object':
            writeObjectProperty(name);
            break;
        case 'constant':
            writeObjectProperty(name);
            break;
        case 'action':

            break;
        case 'predicate':
            generatePredicateInputForm(name);
            break;
        case 'global':
            writeGlobalOption();
        default:
            break;
    }
    selectedInput.type = type;
    selectedInput.name = name;
    console.log(type, name);
}

/**
 * Update the settings for an item when the user selects another input form.
 This avoids users having to always manually click save & apply.
 */
function saveAndApply() {
    updateInputOptionEntity($("#selectionName").html(), $("#selectionType").html());
}

/**Returns a string containing a passed argument object's name and type,
if it has one.
@param {Argument} arg - Argument object*/
function argumentDescriptor(arg) {
    if (typeof(arg.type) != "undefined") {
        return arg.name + " - " + arg.type;
    } else {
        return arg.name;
    }
}

/**Generates a selector from a list of parameters.
  *number will always be 1 or 2 because options apply
  *across at most two parameters.
  *i.e: when ?x takes some value, ?y adopts some transformation
  *@param {array} argumentList - List of objects of type Argument.
  @param {number} number - The number of the argument in the context of the
  predicate option logic (i.e: When true and ?x(arg 1) apply animation to
  ?y(arg 2). It is used to differentiate between the two argument selectors
  in a predicate's input page.
  */
function generateArgumentSelector(argumentList, number) {
    if (typeof(argumentList) != "undefined") {
        if (number > 2 || number <= 0) {
            console.log("invalid number passed to form generator: " + number);
        }
        var result = "<select id=\"arg" + number + "\">";
        for (var i = 0; i < argumentList.length; i++) {
            result += "<option value=\"" + argumentList[i].name + "\">" +
                argumentDescriptor(argumentList[i]) +
                "</option>";
        }
        return result += "</select>";
    } else return " null ";
}

/**Takes an object type as a string and returns all object that match as
 * a list of names.
 *@param {string} type - a type as specified in the pddl definition
 */
function getObjectListFromType(type) {
    var result = [];
    if (typeof(type) != "undefined") {
        Object.keys(initialObjectProperties).forEach(function(key, index) {
            if (initialObjectProperties[key].type == type) {
                result.push(key);
            }
        });
        return result;
    } else {
        Object.keys(initialObjectProperties).forEach(function(key, index) {
            result.push(key);
        });
        return result;
    }
}

/**Takes an array of object names and generates a html select object with
 * those objects as options, as well as a catch-all option.
 *@param {Array} objectList - Array of object names
 */
function generateObjectSelector(objectList) {
    var result = "<select id=\"objectSelector\">";
    result += "<option value=\"anything\"> ** ANY ** </option>";
    for (var i = 0; i < objectList.length; i++) {
        result += "<option value=\"" + objectList[i] + "\">" +
            objectList[i] + "</option>";
    }
    return result + "</select>";
}

/**
 * Generates the input form for a predicate option. This is broken out from the
 * generic generateInputForm function because the predicate form is a little
 * more complicated.
 @param {string} name - Name of the predicate
 */
function generatePredicateInputForm(name) {
    var predicate = getObjectByName(name, predicates);
    var predicateHeader = "<div class=\"predicateOptionSpecification\">When " +
        name + " is " +
        "<select id=\"truthiness\">" +
        "<option value=\"true\">True</option>" +
        "<option value=\"false\">False</option></select>" +
        " and " + generateArgumentSelector(predicate.parameters, 1) +
        " is <select id=\"objectSelector\"><option value=\"anything\">" +
        "** ANY ** </option></select> then the transformation" +
        " below will be applied to the argument " +
        generateArgumentSelector(predicate.parameters, 2) + " : " +
        "</div>";

    return predicateHeader;
}

/**
 *Not yet implemented.
 */
function generateActionInputForm(name) {
    var predicate_list = listActionPredicates(actions, name);
    var result = "";
    result += "<ul id=\"sortable\">"
    for (var i = 0; i < predicate_list.length; i++) {

    }
}

/**
 * Generates the input form from the passed parameters and returns it as an
 html div
 @param {string} name - name of the entity
 @param {string} inputtype - type of the entity
 */
function generateInputForm(name, inputtype) {

    //option input format:
    var imageUrlInput = "<div><p>ImageURL</p><textarea id=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
    var transitionaryImageUrlInput = "<div><p>Transitionary Image URL</p><textarea id=\"transitionaryImageURL\" rows=\"1\" cols=\"25\"></textarea></div>";
    var positionInput = "<div><p>Location</p><textarea id=\"position\" rows=\"1\" cols=\"25\"></textarea></div>";
    var customCSS = "<div><p>Custom CSS Properties</p><textarea id=\"customCSS\" rows=\"5\" cols=\"35\"></textarea></div>";
    var customJS = "<div><p>Custom AnimeJS Properties</p><textarea id=\"customJS\" rows=\"1\" cols=\"25\"></textarea></div>";
    var duration = "<div><p>Animation Duration (ms)</p><input type=\"number\" id=\"duration\"></input></div>";
    var sizeInput = "<div><p>Dimensions(W * H) </p><textarea id=\"size\" rows=\"1\" cols=\"25\"></textarea></div>";
    var labelledInput = "<div><p>Labelled Objects : </p><select id=\"labelled\"><option value=\"true\">True</option>" +
        "<option value=\"false\">False</option></select></div>";
    var spatialOptionsInput = "<div><p>Spatial Layout : </p><select id=\"spatialLayout\"><option value=\"free\">Free</option>" +
        "<option value=\"network\">Network</option>" +
        "<option value=\"grid\">Grid</option></select></div> ";

    var unitsInput = "<div><p>Dimensions and Object Location Unit (% or px) : </p><select id=\"units\">" +
        "<option value=\"%\">Percent</option>" +
        "<option value=\"px\">Pixels</option></select></div>";
    var globalOptionsInput = "<div id=\"globalOptions\" data-type=\"global\">" +
        unitsInput +
        labelledInput +
        customCSS +
        "</div>";

    var objectOptions = imageUrlInput +
        positionInput +
        sizeInput +
        customCSS;

    var predicateOptions = imageUrlInput +
        transitionaryImageUrlInput +
        positionInput +
        sizeInput +
        duration +
        customJS;

    var typeOptions = imageUrlInput +
        sizeInput +
        customCSS +
        spatialOptionsInput;

    var result = "";

    switch (inputtype) {
        case 'type':
            result += typeOptions;
            break;
        case 'object':
            result += objectOptions;
            break;
        case 'constant':
            result += objectOptions;
            break;
        case 'action':
            result += generateActionInputForm(name);
            break;
        case 'predicate':
            result += generatePredicateInputForm(name);
            result += predicateOptions;
            break;
        case 'global':
            result += globalOptionsInput;
            break;
        default:
            result += globalOptions;
            break;
    }

    return "<div class=\"inputOptions\" style=\"margin:auto;\">" + result + "</div>";
}

/*----------------------------------------------------------------------------|
#SECTION 2.2                  Generate Previews
|----------------------------------------------------------------------------*/

/**
 * Generates a div containing a preview of a submitted predicate option.
 It includes a thumbnail of an image and the specified parameters.
 TODO: Should also contain a button to allow deletion of an option.
 @param {string} name - name of the predicate whose options are to be displayed.
 */
function generatePredicateOptionPreview(name) {
    var result = '';
    if (predicateOptions[name].length > 0) {
        for (var i = 0; i < predicateOptions[name].length; i++) {
            var pred = predicateOptions[name][i];
            result += "<div class=\"optionPreview\" onclick=\"writePredicateOption(" + i + ");\"><div>" +
                "When " + pred.name + " is " + pred.truthiness + " and " +
                pred.argument1 + " is " + pred.argument1_value + " animate " +
                pred.argument2 + "</div><div><img class=optionPreviewImage src=\"" +
                pred.animation.image + "\"></img><br>" +
                "</div></div><div class=\"deletebutton\" onclick=\"deletePredicateOption('" +
                name + "'," + i + ");\"" +
                "\"><img src=\"images\\delete.png\" style=\"width:35px;height:35px;\"></img></div>";
        }
        $("#optionsPreview").html(result);
    }
    $("#optionsPreview").html(result);
}

/**
 * Generates a div containing a preview of the options for this object.
 It includes a thumbnail of an image and the specified parameters.
 @param {string} name - name of the object whose options are to be displayed.
 */
function generateObjectPropertyPreview(name, type) {
    var result = '';
    if (type == "type") {
        if (typeOptions[name].image != "undefined") {
            result += "<div class=\"optionPreview\"><div>" +
                "<img class=objectOptionPreviewImage src=\"" +
                typeOptions[name].image + "\"></img>" +
                "</div></div>";
        }
    } else if (type == "object" || type == "constant") {
        if (initialObjectProperties[name].image != "undefined") {
            result += "<div class=\"optionPreview\"><div>" +
                "<img class=objectOptionPreviewImage src=\"" +
                initialObjectProperties[name].image + "\"></img>" +
                "</div></div>";
        }
    }
    $("#optionsPreview").html(result);
    return;
}

/*----------------------------------------------------------------------------|
#SECTION 2.3              CRUD Animation Objects
|----------------------------------------------------------------------------*/
/**Takes the users input
or a given entity and saves them in the requisite options object
@param {string} name - Name of the object
@param {string} optionType - Type of the object
*/
function updateInputOptionEntity(name, optionType) {
    var input;
    console.log("Updated: " + name + " - " + optionType);
    switch (optionType) {
        case "type":
            input = readTypeOption();
            updateTypeOption(name, input);
            console.log(typeOptions[name]);
            break;
        case "constant":
            input = readObjectProperty();
            updateObjectProperty(name, input);
            console.log(initialObjectProperties[name]);
            break;
        case "object":
            input = readObjectProperty();
            updateObjectProperty(name, input);
            console.log(initialObjectProperties[name]);
            break;
        case "predicate":
            input = readPredicateOption();
            updatePredicateOption(name, input);
            generatePredicateOptionPreview(name);
            console.log(predicateOptions[name]);
            break;
        case "action":
            input = readActionOption();
            break;
        case "global":
            readGlobalOption();
            break;
        default:
            console.log("something went wrong trying to create an option entity");
    }
}

/**
 * Read the input from a type options input form
 */
function readTypeOption() {
    var image = $("#imageURL").val();
    var customCSS = $("#customCSS").val();
    var size = $("#size").val();
    var layout = $("#spatialLayout").val();
    var result = [image, customCSS, layout, size];
    return result;
}

/**
 * Write the values of an existing type option object to the input form
  @param {string} name - name of the type
 */
function writeTypeOption(name) {
    $("#imageURL").val(typeOptions[name].image);
    $("#size").val(typeOptions[name].size);
    $("#customCSS").val(typeOptions[name].css);
    $("#spatialLayout").val(typeOptions[name].layout);
}

/**
 * Update the values of a Type Option Object (override them if they exist).
 @param {string} name - the name of the type
 @param {Array} input - a list containing the specified input options
 */
function updateTypeOption(name, input) {
    typeOptions[name] =
        new TypeOption(name, input[0], input[1], input[2], input[3]);
}


/**
 * Read the input from an object options input form
 */
function readObjectProperty() {
    var image = $("#imageURL").val();
    var location = $("#position").val();
    var customCSS = $("#customCSS").val();
    var size = $("#size").val();
    var result = [image, location, size, customCSS];
    return result;
}

/**
 * Write the values of an existing object option object to the input form
  @param {string} name - name of the type
 */
function writeObjectProperty(name) {
    $("#imageURL").val(initialObjectProperties[name].image);
    $("#position").val(initialObjectProperties[name].location);
    $("#customCSS").val(initialObjectProperties[name].css);
    $("#size").val(initialObjectProperties[name].size);

}

/**
 * Update the values of a Type Option Object (override them if they exist).
 @param {string} name - the name of the type
 @param {Array} input - a list containing the specified input options
 */
function updateObjectProperty(name, input) {
    initialObjectProperties[name].image = input[0];
    initialObjectProperties[name].location = input[1];
    initialObjectProperties[name].size = input[2];
    initialObjectProperties[name].css = input[3];
}

/**
 * Read the input from a predicate options input form
 */
function readPredicateOption() {
    var truthiness = $("#truthiness").val();
    var argument1 = $("#arg1").val();
    var argument2 = $("#arg2").val();
    var argument1_value = $("#objectSelector").val();
    var animation = new AnimationOption($("#imageURL").val(), $("#position").val(), $("#customJS").val(), $("#size").val(), $("#duration").val(), $("#transitionaryImageURL").val());
    return [truthiness, argument1, argument2, argument1_value, animation];
}

/**
 * Write the values of existing predicate option objects to the
  preview area
  @param {integer} index - location of the option in the array of
  PredicateOption objects in predicateOptions.name
 */
function writePredicateOption(index) {
    var name = selectedInput.name;
    $("#truthiness").val(predicateOptions[name][index].truthiness);
    $("#arg1").val(predicateOptions[name][index].argument1);
    $("#arg2").val(predicateOptions[name][index].argument2);
    $("#objectSelector").val(predicateOptions[name][index].argument1_value);
    $("#imageURL").val(predicateOptions[name][index].animation.image);
    $("#position").val(predicateOptions[name][index].animation.location);
    $("#customJS").val(predicateOptions[name][index].animation.custom_js);
    $("#size").val(predicateOptions[name][index].animation.size);
    $("#duration").val(predicateOptions[name][index].animation.duration);
    $("#transitionaryImageURL").val(predicateOptions[name][index].animation.transition_image);

}

/**
* This takes a predicates name and the inputs from an input form and, if there is
existing input for this scenario, updates it, otherwise it creates a new predicate
option.
@param {string} name - name of the predicate
@param {array} input - list containing user input
*/
function updatePredicateOption(name, input) {
    var pred = predicateOptions[name];
    //if any animation properties are defined
    if (Boolean(input[4].transition_image) || Boolean(input[4].image) ||
        Boolean(input[4].location) || Boolean(input[4].size) ||
        Boolean(input[4].custom_js) || Boolean(input[4].duration)) {
        for (var i = 0; i < pred.length; i++) {
            if (pred[i].argument1 == input[1] &&
                pred[i].truthiness == input[0] &&
                pred[i].argument2 == input[2] &&
                pred[i].argument1_value == input[3]) {
                pred[i].animation = input[4];
                return;
            }
        }
        console.log("matching predicate option not found");
        predicateOptions[name].push(
            new PredicateOption(name, input[0], input[1], input[2], input[3], input[4])
        );
    }
}

/**
 * TBC
 */
function readActionOption() {

}

/**
 * TBC
 */
function writeActionOption(action_name) {

}

/**
 * Read the values from a global options input form
 */
function readGlobalOption() {
    globalOptions.units = $("#units").val();
    globalOptions.css = $("#customCSS").val();
    globalOptions.labelled = $("#labelled").val();
}

/**
 * Write the existing values to a global options input form
 */
function writeGlobalOption() {
    $("#units").val(globalOptions.units);
    $("#labelled").val(globalOptions.labelled);
    $("#customCSS").val(globalOptions.css);

}

/**
 * Removes a predicate option and updates the preview Window2
 @param {string} name - the name of the predicate
 @param {integer} index - the location of the option to be removed in the list
 of options that exist for the given predicate.
 */
function deletePredicateOption(name, index) {
    predicateOptions[name].splice(index, 1);
    generatePredicateOptionPreview(name);
}

/*----------------------------------------------------------------------------|
#SECTION 3.0             Generate Animation Timeline
|----------------------------------------------------------------------------*/
/**
 * A chronological list of animation entities as defined by all provided input
 */
var animationTimeline = [];

/**
 * The function that populates the chronological list of animation entities
 @param {Array} predicates - List of predicate objects from the parsed domain file
 @param {Array} problem - List of objects from the parsed problem file
 @param {Array} plan - List of Action objects from the parsed plan file
 */
function generateAnimationTimeline(predicates, problem, plan) {
    initialPredicates = problem[1];
    var actionTitle = '';
    animationTimeline.push(new animationEntity("heading", "Initial State"));
    var initial_predicates = listInitialPredicates(predicates, initialPredicates);
    for (var i = 0; i < initial_predicates.length; i++) {
        //attach predicate arguent values with their argument names from the definitions
        animationTimeline.push(new animationEntity("predicate", initial_predicates[i]));
        animationTimeline[i + 1].duration = 10;
    }
    for (var i = 0; i < plan.length; i++) {
        actionTitle = plan[i].name + " ";
        for (var j = 0; j < plan[i].parameters.length; j++) {
            actionTitle += plan[i].parameters[j].value + " ";
        }
        animationTimeline.push(new animationEntity("heading", actionTitle));
        //create an entry for each action's predicate and
        //attach action parameter values with their names from the definitions
        var action_predicates = listActionPredicates(actions, plan[i]);
        for (var k = 0; k < action_predicates.length; k++) {
            animationTimeline.push(new animationEntity("predicate", action_predicates[k]));
        }
    }
}


/**
 * Return a list of  predicates based on this intiial state's definition from
 the input problem file with the parameter values filled in.
  @param {Object} predicate_definitions - The predicate definitions from the input pddl domain
  @param {Object} initial_predicates - The definitions that specify the initial state
 */
function listInitialPredicates(predicate_definitions, initial_predicates) {
    var result = [];
    for (var index = 0; index < initial_predicates.length; index++) {
        item = initial_predicates[index];
        for (var i = 0; i < predicate_definitions.length; i++) {
            if (item.name == predicate_definitions[i].name) {
                if (typeof(predicate_definitions[i].parameters) != "undefined") {
                    for (var j = 0; j < predicate_definitions[i].parameters.length; j++) {
                        item.parameters[j].name = predicate_definitions[i].parameters[j].name;
                        item.parameters[j].type = predicate_definitions[i].parameters[j].type;
                    }
                }
                result.push(item);
                break;
            }
        }
    }
    return result;
}

/**
 * Return a list of defined predicates based on this action's postconditions
   with the parameter values filled in from the input plan.
   @param {Object} action_definitions - The action definitions from the input pddl domain
   @param {Object} action - An instance of an action from the input plan.
 */
function listActionPredicates(action_definitions, action) {
    var result = [];
    //for each action definition
    for (var j = 0; j < action_definitions.length; j++) {
        // find the one that matches the current action name
        if (action.name == action_definitions[j].name) {
            // for each of this actions parameters, set its name and type
            //NOTE:should make sure parameters exist
            if (typeof(action.parameters) != "undefined") {
                for (var k = 0; k < action.parameters.length; k++) {
                    action.parameters[k].name = action_definitions[j].parameters[k].name;
                    action.parameters[k].type = action_definitions[j].parameters[k].type;
                }
            }
            for (var k = 0; k < action_definitions[j].effects.length; k++) {
                var temp_predicate = JSON.parse(JSON.stringify(action_definitions[j].effects[k]));
                // console.log(temp_predicate);
                if (typeof(temp_predicate.parameters) != "undefined") {
                    for (var x = 0; x < temp_predicate.parameters.length; x++) {
                        for (var y = 0; y < action.parameters.length; y++)
                            if (action.parameters[y].name == temp_predicate.parameters[x].name) {
                                temp_predicate.parameters[x].type = action.parameters[y].type;
                                temp_predicate.parameters[x].value = action.parameters[y].value;
                                temp_predicate.parameters[x].name = aa_predicates[temp_predicate.name].parameters[x].name;
                            }
                    }
                }
                result.push(temp_predicate);
            }
            break;
        }
    }
    return result;
}

/**
 * The entities present on the animation timeline (allows distinction between
headings and predicates)
@param {string} type - the type of the animation entity (heading, predicate, etc)
@param {Object} content - Whatever information you want to identify with this state.
For example, when type="predicate" this will contain a Predicate Object
When type="heading" it will contain a string, etc.
 */
function animationEntity(type, content) {
    this.type = type;
    this.content = content;
}

/**
 * Store predicate description; this is the same constructor used in the parser
  @param {string} name - The name of the predicate
  @param {boolean} truthiness - Is it true or false
  @param {string} parameters - Collection of argument objects
* @constructor
 */
function Predicate(name, parameters, truthiness) {
    this.name = name;
    this.truthiness = truthiness;
    this.parameters = parameters;
}

/**
 * Store parameters - this is the same constructor used in the parser
  @param {string} name - The name of the argument
  @param {boolean} type - The type of the argument (if not typed this is undefined)
* @constructor
 */
function Argument(name, type, value) {
    this.name = name;
    this.value = value;
    this.type = type;
}

/*----------------------------------------------------------------------------|
#SECTION 3.1                Schedule Animation Functions
|----------------------------------------------------------------------------*/
var timeouts = [];

function scheduleAnimations(index) {
    var delay_between_states = 20; //Should make this user config'd
    var delay = 1000;
    var duration;
    for (var i = index; i < animationTimeline.length; i++) {
        timeouts.push(setTimeout(executeAnimationFunction.bind(null, i), delay));
        duration = 0;
        if (typeof(animationTimeline[i].duration) == "string") {
            duration = parseInt(animationTimeline[i].duration);
        } else if (typeof(animationTimeline[i].duration) == "number") {
            duration = animationTimeline[i].duration;
        }
        console.log(duration);
        if (duration > 0) {
            delay += (duration + delay_between_states);
        }
    }
}

/**
 *
 */
function executeAnimationFunction(index) {
    console.log("iterating: " + index + " : " + animationTimeline.length);
    if (index > animationTimeline.length) {
        return;
    }
    var animation_function;
    switch (animationTimeline[index].type) {
        case "predicate":
            var log = animationTimeline[index].content.name;
            if (typeof(animationTimeline[index].content.parameters) != "undefined") {
                for (var i = 0; i < animationTimeline[index].content.parameters.length; i++) {
                    log += " , " + animationTimeline[index].content.parameters[i].value;
                }
                console.log(log);
            }
            if (animationTimeline[index].object_properties &&
                animationTimeline[index].duration &&
                animationTimeline[index].stage_location) {

                animation_function = generateAnimationFunction(animationTimeline[index].object_properties,
                    animationTimeline[index].duration,
                    animationTimeline[index].stage_location);
                console.log(animation_function);
                if (typeof(animation_function) != "undefined") {
                    //run the animation
                    animation_function[0]();

                    //set the final images
                    if (animation_function[1]) {
                        console.log(animationTimeline[index].duration);
                        setTimeout(animation_function[1], animationTimeline[index].duration);
                    }
                    objectProperties = animationTimeline[index].object_properties;
                    stageLocation = animationTimeline[index].stage_location;
                }
            }
            break;
        case 'heading':
            console.log(animationTimeline[index].content);
            break;
        default:
    }
}


/*----------------------------------------------------------------------------|
#SECTION  3.2                Generate Animation Functions
|----------------------------------------------------------------------------*/
/**
 * Takes an animation entity and creates and executes the function required to
 transition between the current visual state and the visual state defined by the
 animation entities attached defintions.
 @param {Object} object_properties - The desired visualisation specification for each object
 @param {number} duration - The duration of the desired animation function in ms
 @param {Object} stage_location - The desired coordinates on the stage for each object.
 */
function generateAnimationFunction(object_properties, duration, stage_location) {
    //the animation function
    var funcdef = "";
    //the function that sets an image if theer's a transition image defined
    var set_final_images = "";

    var objects = Object.keys(object_properties);
    objects.forEach(function(key, index) {
        var item = object_properties[key];
        //if there's a transition image, apply it.
        if (typeof(item.transition_image) != "undefined" && item.transition_image != "") {
            funcdef += "$(\'#" + item.name + "\').attr(\'background-image\',\"url(\'" + item.transition_image + "\')\");";
            // console.log(funcdef);
            // item.transition_image = "";
        }
        if ((typeof(item.transition_image) != "undefined" && item.transition_image != "") ||
            (item.image != "")) {
            if (typeof(item.image) != "undefined") {
                set_final_images += "$(\'#" + item.name + "\').attr(\'background-image\',\"url(\'" + item.image + "\')\");";
            } else {
                set_final_images += "$(\'#" + item.name + "\').attr(\'background-image\',\"url(\'" + objectProperties[item.name].image + "\')\");";
            }
        }
        //add /\ location translations and duration to animation
        funcdef += "anime({targets: \"#" + item.name + "\",";
        funcdef += "duration: " + duration + ", ";
        console.log(duration);
        if (stage_location[item.name][0] != stageLocation[item.name][0] || stage_location[item.name][1] != stageLocation[item.name][1]) {
            console.log("moving " + item.name + ": " + stageLocation[item.name] + " to " + stage_location[item.name]);
            funcdef += "left: [\'" + stageLocation[item.name][0] + globalOptions.units + "\',\'" + stage_location[item.name][0] + globalOptions.units + "\'],";
            funcdef += "bottom: [\'" + stageLocation[item.name][1] + globalOptions.units + "\',\'" + stage_location[item.name][1] + globalOptions.units + "\'],";
        }
        if (typeof(item.size) != "undefined" && item.size !== objectProperties[item.name].size) {
            currentSize = getWidthAndHeight(item.name, objectProperties);
            size = getWidthAndHeight(item.name, object_properties);
            console.log("scaling " + item.name + ": " + currentSize[0] + ", " + currentSize[1] +
                size[0] + ", " + size[1]);
            funcdef += "width: [\'" + currentSize[0] + globalOptions.units + "\',\'" + size[0] + globalOptions.units + "\'],";
            funcdef += "height: [\'" + currentSize[1] + globalOptions.units + "\',\'" + size[1] + globalOptions.units + "\'],";
        }

        //add content of custom_js property
        if (typeof(item.custom_js) != "undefined") {
            funcdef += item.custom_js;
            item.custom_js = "";
        }
        funcdef += "});";


    });

    //set Globals to match new state.

    stageLocation = stage_location;
    objectProperties = object_properties;
    // console.log(object_properties);
    // console.log(stage_location);
    // console.log(funcdef);
    var result = [Function(funcdef)];
    if (set_final_images.length != "") {
        result.push(Function(set_final_images));
    }
    return result;
}

/*----------------------------------------------------------------------------|
#SECTION 3.3          Generate Animation's Visual States
|----------------------------------------------------------------------------*/
/** Adds the state of the objects, their locations, and the desired duration
of any animation to the relevant entity in the animation timeline
 *
 */
function addStatesToAnimationEntities() {
    //Creates a deep copy
    var object_properties = JSON.parse(JSON.stringify(objectProperties));
    var stage_location = JSON.parse(JSON.stringify(stageLocation));

    var previous_state = {};
    previous_state.object_properties = object_properties;
    previous_state.stage_location = stage_location;

    for (var i = 0; i < animationTimeline.length; i++) {
        if (animationTimeline[i].type == "predicate") {
            var temp = generateNewState(animationTimeline[i], previous_state.object_properties, previous_state.stage_location);
            if (typeof(temp) != "undefined") {
                duration = temp[0][1];
                animationTimeline[i].object_properties = temp[0][0];
                previous_state.object_properties = temp[0][0];
                animationTimeline[i].stage_location = temp[1];
                previous_state.stage_location = temp[1];
                if (typeof(duration) == "number" ||
                    (typeof(duration) == "string" && duration !== "")) {
                    animationTimeline[i].duration = duration;
                } else {
                    animationTimeline[i].duration = 0;
                }
            }
        }
    }
}
/**
 * Take the current object states, the current stage locations,
 and the next predicate or action animation entity. If it's a predicate, return an object
 containing the updated object_properties and the updated stage_locations
 This should then be attached to the animationEntity*/
function generateNewState(animation_entity, object_properties, stage_locations) {
    if (animation_entity.type == "predicate") {

        var predicate = animation_entity.content;
        var keys = Object.keys(object_properties);

        var animations = findMatchingAnimationOptions(predicate, predicateOptions);
        // console.log(animations);
        if (animations != false && typeof(animations) != "undefined" && animations[0].length > 0) {
            var updated_object_properties = get_updated_objectProperties(animations, object_properties);
            var duration = updated_object_properties[1];
            // console.log(updated_object_properties);
            var updated_stage_locations = get_updated_stageLocations(updated_object_properties[0], stage_locations);
            // console.log(updated_stage_locations);
            return [updated_object_properties, updated_stage_locations];
        }
    }
}

function setImage(object, image) {
    $("#" + object).attr("background-image", "url(" + image + ")");
}
/**
 * takes a predicate with arguments populated from the calling action and
 returns a list of all applicable animations and which argument they target.
 @param {Object} predicate - A predicate object generated from an input plan action
 */
function findMatchingAnimationOptions(predicate, defined_options) {
    var options = defined_options[predicate.name];
    // console.log(options);
    // console.log(predicate);
    if (typeof(options) != "undefined" && options.length > 0) {
        var result = []; //will have least specific options at the front of the array.
        for (var i = 0; i < options.length; i++) {
            var arg1 = null;
            var arg2 = null;
            if (options[i].truthiness == predicate.truthiness) {
                //If it's an exact match, add to end of array
                for (var j = 0; j < predicate.parameters.length; j++) {
                    // console.log("option: " + options[i].argument1 + " parameter: " + predicate.parameters[j].name);
                    if (options[i].argument1 == predicate.parameters[j].name) {
                        arg1 = predicate.parameters[j];
                    }
                    if (options[i].argument2 == predicate.parameters[j].name) {
                        arg2 = predicate.parameters[j];
                    }
                }
                // console.log([arg1, arg2]);
                if (options[i].argument1_value == arg1.value) {
                    //add the option and target object
                    result.push([options[i].animation, arg2]);

                    // console.log("Matching Predicate Option (exact):");
                    // console.log(options[i]);
                    // console.log(predicate);

                    //if its a catchall match add it to the start
                } else if (options[i].argument1_value == "anything") {
                    result.unshift([options[i].animation, arg2]);
                    // console.log("Matching Predicate Option (catchall):");
                    // console.log(options[i]);
                    // console.log(predicate);
                }
            }
        }
        return [result, predicate];
    } else {
        return;
    }

}


/**This function should be iteratively run over the results of the findMatchingPredicateAnimations
function with the exception of updated location, which will come from get_updated_stageLocations
 */
function get_updated_objectProperties(animation, object_properties) {

    var animations = animation[0];
    var predicate = animation[1];
    var duration = 0;
    var result = JSON.parse(JSON.stringify(object_properties));

    var keys = Object.keys(result);

    //null all previous transition images
    for (var i = 0; i < keys.length; i++) {
        result[keys[i]].transition_image = "";
    }

    for (var i = 0; i < animations.length; i++) {
        var target = animations[i][1];
        // console.log(target);

        //if there's a transition image, add it to the updated properties
        if (typeof(animations[i][0].transition_image) != "undefined" && animations[i][0].transition_image !== "") {
            result[target.value].transition_image = animations[i][0].transition_image;
        }

        //update location
        if (typeof(animations[i][0].location) != "undefined" && animations[i][0].location !== "") {
            //if the location is relative to a predicate's parameter, resolve it to an object
            if (typeof(animations[i][0].location) == "string" &&
                animations[i][0].location.indexOf("?") > -1) {
                // console.log("parameter location : " + animations[i][0].location);
                var temp = animations[i][0].location.split(":");
                var target_object;
                for (var j = 0; j < predicate.parameters.length; j++) {
                    // console.log(predicate.parameters[j].name + ":" + temp[1]);
                    if (predicate.parameters[j].name == temp[1]) {
                        target_object = predicate.parameters[j].value;
                    }
                    result[target.value].location = temp[0] + ":" + target_object;
                    // console.log("resolved to: " + result[target.value].location);
                }
            } else {
                result[target.value].location = animations[i][0].location;
            }
        }

        //update css
        if (typeof(animations[i][0].custom_js) != "undefined" && animations[i][0].custom_js != "") {
            result[target.value].custom_js = animations[i][0].custom_js;
        }

        if (typeof(animations[i][0].image) != "undefined" && animations[i][0].image != "") {
            result[target.value].image = animations[i][0].image;
        }
        //updtae duration
        if (typeof(animations[i][0].duration) != "undefined") {
            duration = animations[i][0].duration;
        }

        //update size
        if (typeof(animations[i][0].size) != "undefined" && animations[i][0].size.length>1) {
            result[target.value].size = animations[i][0].size;
        }

    }
    return [result, duration];
}

/**User to store current location of visual objects (coordinates)
 * @global
 */
var stageLocation = {};

/**
 * return coordinates of all objects whose location has changed due to an
    updated ObjectProperty property
 */
function get_updated_stageLocations(object_properties, stage_locations) {
    // console.log(object_properties);
    var result = JSON.parse(JSON.stringify(stage_locations));
    var keys = Object.keys(stage_locations);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var location;
        if (typeof(object_properties[key].location) != "undefined") {
            location = getStageLocation(key, object_properties, result, 0);
        }
        result[key] = location;
    }
    return result;
}

/**
 * Returns the width and height of the object given its current properties.
 @param {string} object - The name of the object
 @param {Object} object_properties - Assosciative array containing the current
 properties of all objects.
 */
function getWidthAndHeight(object, object_properties) {
    if (typeof(object_properties[object].size) != "undefined") {
        return object_properties[object].size.split(",");
    }
}

/*----------------------------------------------------------------------------|
#SECTION 4.0           Generate Stage and Populate with Objects
|----------------------------------------------------------------------------*/
/**
 * Creates the animation stage, applies specified CSS and displays objects in
 their specified initial state
 */
function createInitialStage() {
    //create a copy of the initial properties
    objectProperties = JSON.parse(JSON.stringify(initialObjectProperties));

    $("#Window3").html("<input id=\"gotoWindow2\" type=\"button\" " +
        " value=\"Return to Options Input Screen\"" +
        " onclick=\"switchToInputWindow();\" style=\"position:absolute;z-index:99\">" +
        "</input><input id=\"play\" type=\"button\" " +
        " value=\"Play Animation\"" +
        " onclick=\"scheduleAnimations(0);\" style=\"position:absolute;top:15px;z-index:99;\"></input>" +
        "<div id=\"stage\">" +
        "</div>");

    console.log(globalOptions.css);

    //apply typeOptions (shit these are overriding the specific inputs, which
    //inverts the desired heirarchy. I should do this first, then write over everything)
    var typekeys = Object.keys(typeOptions);
    for (var i = 0; i < typekeys.length; i++) {
        var object_type = typekeys[i];
        var targets = getObjectListFromType(object_type);
        for (var j = 0; j < targets.length; j++) {
            var object_name = targets[j];
            if (typeof(objectProperties[object_name].css) == "undefined" || objectProperties[object_name].css === "") {
                objectProperties[object_name].css = typeOptions[object_type].css;
            }
            if (typeof(objectProperties[object_name].image) == "undefined" || objectProperties[object_name].image === "") {
                objectProperties[object_name].image = typeOptions[object_type].image;
            }
            if (typeof(objectProperties[object_name].size) == "undefined" || objectProperties[object_name].size === "") {
                objectProperties[object_name].size = typeOptions[object_type].size;
            }
        }
    }

    //1. Place them on the stage
    var object_keys = Object.keys(objectProperties);
    var objectshtml = "";
    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        var object = objectProperties[key];
        var objectcontainer = "";
        objectcontainer += "<div id=\"" + object.name + "\" class=\"objectImage\" style=\"position:absolute;background-image:url(\'" + object.image + "\');\">";
        if (globalOptions.labelled === "true") {
            console.log(globalOptions.labelled);
            objectcontainer += key;
        }
        objectcontainer += "</div>";
        objectshtml += objectcontainer;
    }

    $("#stage").html(objectshtml);

    //apply user defined CSS to the stage
    if (typeof(globalOptions.css) != "undefined") {
        console.log(globalOptions);
        applyCSS(globalOptions.css, "Window3");
    }

    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        stageLocation[key] = objectProperties[key].location;
    }

    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        //2. set their size
        var size = getWidthAndHeight(key, objectProperties);
        // console.log("Size of "+key+" :" + size[0] +" , "+ size[1]);
        stageLocation[key] = getStageLocation(key, objectProperties, stageLocation, 0);
        var x = stageLocation[key][0];
        var y = stageLocation[key][1]
        if (typeof(size) != "undefined") {
            console.log("Applying dimensions to " + key + " to " + size[0] + "," + size[1]);
            $("#" + key).css("min-width", size[0] + globalOptions.units);
            //NOTE: Height is currently useless. object-fit doesnt work. need to fix
            $("#" + key).css("min-height", size[1] + globalOptions.units);
        }

        var mleft = x.toString() + globalOptions.units;
        var mtop = y.toString() + globalOptions.units;
        $("#" + key).css("left", mleft);
        $("#" + key).css("bottom", mtop);
        //4. apply any custom CSS
        applyCSS(objectProperties[key].css, key);
    }
}

/**
 * Applies css to target objects instance in the DOMAIN
 @param {string} css - the string of css options
 @param {string} targetName - the name of the target object
 */
function applyCSS(css, targetName) {
    // console.log("applyCSS("+targetName+")");
    if (typeof(css) != "undefined") {
        var css_statements = css.split(/[\n\r]/g);
        if (css_statements != false) {
            for (var i = 0; i < css_statements.length; i++) {
                var item = css_statements[i];
                var property = item.split(':')[0];
                var value = item.split(':').slice(1).join(':');
                if (property != "" && value != "") {
                    console.log("#" + targetName);
                    console.log(property + "," + value);
                    //remove trailing semicolon
                    value = value.replace(/;$/, '');
                    $("#" + targetName).css(property, value);
                }
            }
        }
    }
}

/*----------------------------------------------------------------------------|
#SECTION 4.1           Resolve Location Input to Coordinates
|----------------------------------------------------------------------------*/

//use the ObjectPropertys objects as paramater stores.
//NOTE: ObjectPropertys.location always has to be a string
function getStageLocation(objectName, object_properties, stage_locations, depth) {
    //To avoid crashing due to potentially unlimited mutual recursion.
    if (depth > objects.names.length) {
        console.log("Problem resolving location for: " + objectName);
        return;
    }
    if (object_properties[objectName].location) {
        var location = object_properties[objectName].location;
        // console.log(object_properties);
        // console.log(objectName + "  :  " + location);

        if (typeof(location) == "string") {
            location = object_properties[objectName].location.split(",");
            //Either they're coordinates
            if (location.length == 2) {
                var size = getWidthAndHeight(objectName, object_properties);

                return [parseFloat(location[0]) - 0.5 * parseFloat(size[0]),
                    parseFloat(location[1]) - 0.5 * parseFloat(size[1])
                ];
            }
            //or a relative position
            else {
                return resolveRelativeLocation(objectName, object_properties, stage_locations, depth + 1);
            }
        } else {
            //Either they're coordinates
            if (location.length == 2) {
                return [location[0], location[1]];
            }
        }
    } else {
        console.log("no location : " + objectName);
    }
}
//I should throw an exception if these two functions mutually recurse more times than there
//are objects and let the user knwo they mucked up their relative positioning spec

//Should also throw error when an object is assigned a location relative to itself.
function resolveRelativeLocation(objectName, object_properties, stage_locations, depth) {
    var location = object_properties[objectName].location.split(":");
    // console.log(location);
    var position = location[0].trim();
    var relative_to_object = location[1].trim();

    //if an object is positioned relative to itself, fuggedaboutit
    if (objectName == relative_to_object) {
        console.log("ERROR: " + objectName + " is positioned relative to itself.");
        return;
    }

    // var dimensions  = getWidthAndHeight(object);
    var relative_to_position = getStageLocation(relative_to_object, object_properties, stage_locations, depth);
    if (objectName == relative_to_object) {
        return [0, 0];
    }
    // console.log(position + " : " + relative_to_object);
    // console.log(dimensions_of_relative_object);
    // console.log(relative_to_position);

    var dimensions_of_relative_object = getWidthAndHeight(relative_to_object, object_properties);
    if (typeof(dimensions_of_relative_object) == "undefined") {
        dimensions_of_relative_object = [0, 0];
    }
    var x, y;
    switch (position) {
        case "on":
            return relative_to_position;
        case "left":
            //translate it by half(width of object + width of relative_to_object) from relative_to_position
            x = relative_to_position[0] - parseFloat(dimensions_of_relative_object[0]);
            y = relative_to_position[1];
            return [x, y];
        case "right":
            x = relative_to_position[0] + parseFloat(dimensions_of_relative_object[0]);
            y = relative_to_position[1];
            return [x, y];
        case "above":
            y = relative_to_position[1] + parseFloat(dimensions_of_relative_object[1]);
            x = relative_to_position[0];
            // console.log(relative_to_position + " : " + [x,y]);
            return [x, y];
        case "below":
            y = relative_to_position[1] - parseFloat(dimensions_of_relative_object[1]);
            x = relative_to_position[0];
            return [x, y];
    }
}

/*----------------------------------------------------------------------------|
#SECTION 5.0               Save Animation Specification
|----------------------------------------------------------------------------*/

/**Serialize and output the animation options objects,
I should add a call to updateInputOptionEntity to ensure the last option input
is not lost in case the user forgets to click save & apply
@param {string} text - the JSON string containing all applied options
@param {string} name - default name of the saved text file
@param {string} type - the output text file's type
*/
function downloadOptionsInput(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {
        type: type
    });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

/**
 * Stringifies the animation input and runs the download function.
 */
function downloadAnimationOptions() {
    var saveFile = JSON.stringify([typeOptions, initialObjectProperties, predicateOptions, globalOptions]);
    downloadOptionsInput(saveFile, 'animation_options.txt', 'text/plain');
}

/*----------------------------------------------------------------------------|
#SECTION  5.1             Load Animation Specification
|----------------------------------------------------------------------------*/

/**Deserialize the saved objects from txt file and repopulate based on whether
the objects/predicates/etc exist in the newly parsed problem.
TODO: Should provide some feedback on things that are no longer found.
@param {file} file - the text file output from a previous save*/
function parseSavedFile(file) {
    readFile(file, function(e) {
        var objects;
        try {
            objects = JSON.parse(e.target.result);
        } catch (x) {
            console.log(x);
        } finally {
            var typekeys = Object.keys(objects[0]);
            var objectkeys = Object.keys(objects[1]);
            var predicatekeys = Object.keys(objects[2]);

            for (var i = 0; i < typekeys.length; i++) {
                typekeys[i] = typekeys[i].toLowerCase();
                typeOptions[typekeys[i]] = objects[0][typekeys[i]];
                writeTypeOption(typekeys[i]);
            }
            for (var i = 0; i < objectkeys.length; i++) {
                objectkeys[i] = objectkeys[i].toLowerCase();
                initialObjectProperties[objectkeys[i]] = objects[1][objectkeys[i]];
                writeObjectProperty(objectkeys[i]);
            }
            for (var i = 0; i < predicatekeys.length; i++) {
                predicatekeys[i] = predicatekeys[i].toLowerCase();
                predicateOptions[predicatekeys[i]] = objects[2][predicatekeys[i]];
                //writePredicateOption??
            }
            if (typeof(objects[3]) != "undefined") {
                globalOptions = objects[3];
            }
        }
        console.log(objects);
    });
}
