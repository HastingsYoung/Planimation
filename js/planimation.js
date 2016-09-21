var domain_file;
var problem_file;
var plan_file;

var readDomain = false;
var readProblem = false;
var readPlan = false;

var globalOptions = new GlobalOptions();
var typeOptions;
var animatedObjects;
var animatedPredicates;
/*
****************      LOAD TEST FILES     **********************
*/

$(document).ready(function(){
    $('#inputdomain').on('change', function(e){
        domain_file=this.files[0];
    });

    $('#inputproblem').on('change', function(e){
        problem_file=this.files[0];
      });

    $('#inputplan').on('change', function(e){
        plan_file=this.files[0];
    });
});

function readFile(file, callback){
    var reader = new FileReader();
    reader.onload = callback
    reader.readAsText(file);
}

/*
****************      PARSE LOADED FILES     **********************
*/

/*Parses the loaded plan and returns a list of actions*/
function parseSolution(domain, problem, callback) {
    readFile(plan_file, function(e) {
      try {
        plan = Plan_Parser.parse(e.target.result);
        console.log(plan);

      } catch (x) {
        console.log(x);
      } finally {callback(domain,problem,plan);}
    });
}

/*Parses the loaded problem file and returns
[objects, startPredicates]
NOTE: Sometimes has problems if the file ends in an RPAREN,
I think the parser misses the EOF token when this is the case, adding a
whitespace character at the end seems to fix it.*/
function parseProblem(domain, callback) {
      readFile(problem_file, function(e) {
        try {
          problem = PDDL_Parser.parse(e.target.result);
          console.log(problem);

        } catch (x) {
          console.log(x);
        } finally {return parseSolution(domain,problem,callback);}
      });
}

/*Parses the loaded domain file and returns
[types, constants, predicates, actionList]*/
function parseDomain(callback) {
  readFile(domain_file, function(e) {
    try {
      domain = PDDL_Parser.parse(e.target.result);
      console.log(domain);

    } catch (x) {
      console.log(x);
    } finally {parseProblem(domain, callback);}
  });
}

function parseInputFiles() {
  /*
    domain  = [[types], [constants], [predicates], [actionList]]
              types =
              constants = [[names],[typeIndex],[types]]

    problem = [[objects], [startPredicates]]
    plan    = [actions]
  */
  function getInput(domain,problem,plan) {
    createAnimationObjects(domain,problem,plan);
    var inputSelector = createInputSelector(domain,problem);
    document.getElementById("Window1").style.display="none";
    document.getElementById("Window2").style.display="block";
    $("#inputSelector").append(inputSelector);
    generateInputForm(domain,problem,plan);
    $("#submitInputs").append("<p></p><input id=\"submitInputs\" type=\"button\" "
          + "value=\"Submit Input\" onclick=\"createAnimationObjects();\">");
  }
    parseDomain(getInput);
}

/*
****************      GENERATE INPUT FORM    **********************
*/
function setInputForm(inputform) {
    $('#optionsInput').innerHTML(inputform);
}

function createInputSelector(domain,problem) {
  var types = domain[0];
  var constants = domain[1];
  var predicates = domain[2];
  var objects = problem[0];

  var itemCell = "<td class=\"item\" onclick=\"selectInput(event);\"";
  var output = "";
  output += "<table id=\"inputTable\"><tbody><tr><td class=\"item\">Global Options</td></tr>";
  //Input form for types
  if(types.length>0){
    output += "<tr><td class=\"itemGroup\">Types</td></tr>";
    for(var i=0; i<types.length; i++){
        output += "<tr>" + itemCell + "data-type=\"type\">"
                + types[i] + "</td></tr>";
    }
  }

  if(constants.names.length>0) {
    output += "<tr><td class=\"itemGroup\">Constants</td></tr>";
    for(var i = 0; i<constants.names.length; i++){
      output += "<tr>" + itemCell + "data-type=\"constant\">"
              + constants.names[i] + "</td></tr>";
    }
  }

  if (objects.names.length>0){
    output += "<tr><td class=\"itemGroup\">Objects</td></tr>";
    for(var i = 0; i<objects.names.length; i++){
      output += "<tr>" + itemCell + "data-type=\"object\">"
              + objects.names[i] + "</td></tr>";
    }
  }

  if(predicates.length>0){
    output += "<tr><td class=\"itemGroup\">Predicates</td></tr>";
    for(var i = 0; i<predicates.length; i++){
      output += "<tr>" + itemCell + "data-type=\"predicate\">"
              + predicates[i].name + "</td></tr>";
    }
  }

  output += "</tbody></table>";
  return output;
}

/*This is the function that runs when an item from the list of objects/types
is clicked. It loads the available options into the #inputOptions div*/
function selectInput(e) {
  var select = e.target.innerHTML;
  console.log(select);
}

function generateInputForm(domain,problem,plan) {
  function PrintIfNotNull(inputstring){
    if(inputstring!=null){
      return inputstring;
    }
  }
  //option input format:
  var imageUrlInput = "<tr>ImageURL<textarea name=\"imageURL\" rows=\"1\" cols=\"25\"></textarea></tr>";
  var visibilityInput = "<tr>Is Visible?<input name=\"visible\"type=\"checkbox\" checked></tr>";
  var positionInput = "<tr>Initial Position<textarea name=\"position\" rows=\"1\" cols=\"25\"></textarea></tr>"
  var scaleInput = "<tr>Scale<input name=\"scale\" type=\"number\" step=\"0.01\"></tr>"
  var zInput = "<tr>Z Ordering<input name=\"zInput\" type=\"number\"></tr>"

  var imagePreview = "<tr name=\"preview\"></tr>";

  var animationInput
      = "<tr><select name=\"animation\"><option value=\"animation1\">Animation 1</option>"
      + "<option value=\"animation2\">Animation 2</option>"
      + "<option value=\"animation3\">Animation 3</option></tr>"
      ;

  var spatialOptionsInput
      = "<tr>Spatial Layout<select name=\"spatialLayout\"><option value=\"free\">Free</option>"
      + "<option value=\"network\">Network</option>"
      + "<option value=\"grid\">Grid</option></tr>"
      ;

  var globalOptionsInput
      = "<table align=\"center\" class=\"pure-table pure-table-bordered\">"
      + spatialOptionsInput
      + "</table>"
      ;

  var constantOptions
      = imageUrlInput
      + visibilityInput
      + positionInput
      + scaleInput
      + zInput
      + imagePreview
      ;

  var  constantOptionsInput
      = "<table align=\"center\" class=\"pure-table pure-table-striped pure-table-bordered\">"
      + "<thead><tr>"
  + "<th>Object</th>"
      + "<th>Image URL</th>"
      + "<th>Visible?</th>"
      + "<th>Initial Position</th>"
      + "<th>Scale</th>"
      + "<th>Z-Ordering</th>"
      + "<th>Image Preview</th>"
      //relative positioning options?
      + "</tr>"
      + "</thead>"

      ;
  var  objectOptionsInput
      = "<table align=\"center\" class=\"pure-table pure-table-striped pure-table-bordered\">"
      + "<thead><tr>"
    + "<th>Object</th>"
      + "<th>Image URL</th>"
      + "<th>Visible?</th>"
      + "<th>Initial Position</th>"
      + "<th>Scale</th>"
      + "<th>Z-Ordering</th>"
      + "<th>Image Preview</th>"
      //relative positioning options?
      + "</tr>"
      + "</thead>"

      ;

  var  predicateOptionsInput
      = "<table align=\"center\" class=\"pure-table pure-table-striped pure-table-bordered\">"
      + "<thead><tr>"
      + "<th>Predicate</th>"
      + "<th>Value</th>"
      + "<th>Argument</th>"
      + "<th>Substitute Image URL</th>"
      + "<th>Animate Image</th>"
      + "<th>Move To Position</th>"
      + "<th>Scale</th>"
      + "<th>Z-Ordering</th>"
      + "<th>Image Preview</th>"
      //relative positioning options?
      + "</tr>"
      + "</thead>"

      ;

  var predicateOptions
      = imageUrlInput
      + animationInput
      + positionInput
      + scaleInput
      + zInput
      + imagePreview
      ;

  var typeOptionsInput
      = "<table align=\"center\" class=\"pure-table pure-table-bordered\">"
      + "<thead><tr>"
      + "<th>Type</th>"
      + "<th>Default Image URL</th>"
      + "<th>Visible?</th>"
      + "<th>Image Preview</th>"
      + "</tr>"
      + "</thead>"
      ;

  var typeOptions
      = imageUrlInput
      + visibilityInput
      + imagePreview
      ;

  $("#globalOptions").append(globalOptionsInput);

  if(domain != null){
    var types = domain[0];
    var constants = domain[1];
    var predicates = domain[2];

    //Input form for types
    if(types.length>0){
      //Option Headings
      for(var i=0; i<types.length; i++){
          typeOptionsInput += "<tr id=\""+types[i]+"\"><td>" + types[i] + "</td>";
          typeOptionsInput += typeOptions;
          typeOptionsInput += "</tr>";
      }
      typeOptionsInput += "</table>";
      $("#typeOptions").append(typeOptionsInput);
    }

    //Input form for constants
    if(constants.names.length>0) {
      for(var i = 0; i<constants.names.length; i++){
        constantOptionsInput += "<tr id=\"" + constants.names[i] + "\"><td>" + constants.names[i] + "</td>";
        constantOptionsInput += constantOptions;
        constantOptionsInput += "</tr>";
      }
      constantOptionsInput += "</table>";
      $("#constantOptions").append(constantOptionsInput);
    }

    //Input form for predicates
    if(predicates.length>0){
      for(var i = 0; i<predicates.length; i++){
        predicateOptionsInput += "<tr name=\""+predicates[i].name+"\"><td rowspan=\""
                              + (predicates[i].arguments.length)*2 + "\">"
                              + predicates[i].name + "</td>";

        predicateOptionsInput += "<td>True</td><td rowspan=\"2\">"+ predicates[i].arguments[0].name+ " " +PrintIfNotNull(predicates[i].arguments[0].type);+"</td>";
        predicateOptionsInput += predicateOptions + "</tr>"
        predicateOptionsInput += "<tr><td>False</td>";
        predicateOptionsInput += predicateOptions + "</tr>";

        for(var j = 1; j<predicates[i].arguments.length; j++) {
          predicateOptionsInput += "<tr><td>True</td><td rowspan=\"2\">"+ predicates[i].arguments[j].name + " " +PrintIfNotNull(predicates[i].arguments[j].type);+"</td>";
          predicateOptionsInput += predicateOptions + "</tr>"
          predicateOptionsInput += "<tr><td>False</td>";
          predicateOptionsInput += predicateOptions + "</tr>";
        }
      }

      predicateOptionsInput += "</table>";
      $("#predicateOptions").append(predicateOptionsInput);

    }
  }

  if(problem!=null){
    var objects = problem[0];

    //Input form for objects
    if (objects.names.length>0){
      for(var i = 0; i<objects.names.length; i++){
        objectOptionsInput += "<tr id=\"" + objects.names[i] + "\"><td>" + objects.names[i] + "</td>";
        objectOptionsInput += constantOptions;
        objectOptionsInput += "</tr>";
      }
      constantOptionsInput += "</table>";
      $("#objectOptions").append(objectOptionsInput);
    }
  }
}

/*Gets the values from the HTML form and attaches them to the relevant
objects*/
function getInputValues() {
//When adding something here, don't forget to add an equivalent entry in
//setInputValues()

  //globalOptions
  globalOptions.spatialLayout = $("#globalOptions").find("select[name=spatialLayout]").val();
  console.log(globalOptions);

  if(domain!=null){
    //typeOptions
    if(domain[0].length>0){
      for(var i=0; i<domain[0].length; i++){
        var thisOption =  $("#"+domain[0][i]);
        var visible = thisOption.find("textarea[name=visible]").val();
        var imageURL = thisOption.find("textarea[name=imageURL]").val();
        typeOptions.push(new typeOption(domain[0][i],visible,imageURL));
      }
    console.log(typeOptions);
    }


  }
}

/*
****************      SAVE FORM INPUT        **********************
*/


/*
****************      LOAD FORM INPUT        **********************
*/


/*
****************      POPULATE OBJECTS       **********************
*/

function createAnimationObjects(domain,problem,plan){

  globalOptions = new GlobalOptions();


}
/*Create interface for setting up the animation
Each object, constant and predicate should be listed with the following options
General Options:
- spatial layout (grid, network, free)
*/

function TypeOption(typeName, visible, defaultImageURL) {
  this.typeName=typeName;
  this.visible=visible;
  this.defaultImageURL=defaultImageURL;
}

function GlobalOptions(spatialLayout) {
    this.spatialLayout = spatialLayout;
}

/*
For objects/constants
- Visible?
- Set Image
- Set initial position
- relative positioning options (above ?x, etc)
(maybe whether or not the relative positioning is persistant throughout
the animation)
- relative ordering (could probably use a z-property for this)
*/

function AnimatedObject(object, visible, imageURL, location, z) {

}

/*
for predicates:
- set image?
- set position
- sprite swap arguments when true/false and/or when value changes
- animate argument/s when true/false
- translate argument/s when true/false
- set relative position of argument/s when true/false
- set z-property of argument/s
*/

function AnimatedPredicate(predicate, animatedArgument, isTrue) {

}

/*all setX arguments are arrays with the first value corresponding to
when the predicate evaluates to true and the second when it's false.
*/
function animatedArgument(argument, type, setImage, setTransitionImage,
  setAnimation, setTranslation, setZ, setRelativePosition){
    this.argument = argument;
}

function relativePosition(object, relativePosition) {

}

/*
These options should be exportable via JSON.
*/

/*********************************************
            Pixi.js playground
**********************************************/
var width = 256;
var height = 256;
var center = [width/2, height/2];

//Create the renderer
var renderer = PIXI.autoDetectRenderer(width, height);

//Add the canvas to the HTML document
$(document).ready(function(){
$('#animation').append(renderer.view);
});

//Create a container object called the `stage`
var stage = new PIXI.Container();

//Tell the `renderer` to `render` the `stage`
renderer.render(stage);
