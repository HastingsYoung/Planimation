var animationTimeline = [];

function generateAnimationTimeline(domain,problem,plan){
  initialPredicates = problem[1];
  var actionTitle = '';
  animationTimeline.push(new animationEntity("heading","Initial State"));
  for(var i = 0; i<initialPredicates.length;i++){
    animationTimeline.push(new animationEntity("predicate",initialPredicates[i]));
  }
  for(var i = 0; i<plan.length;i++) {
    var actionTitle = plan[i].name + " ";
    for(var j = 0; j<plan[i].parameters.length; j++){
      actionTitle += plan[i].parameters[j] + " ";
    }
    animationTimeline.push(new animationEntity("heading",actionTitle));
    var action_predicates = list_action_predicates(domain[3], plan[i]);
    for(var k = 0; k<action_predicates.length;k++) {
      animationTimeline.push(new animationEntity("predicate",action_predicates[k]));
    }
  }
  console.log(animationTimeline);
}

/**
 *Ties the value to the attribute name (e.g ?x = airplane)
 There are a few ways to do this without using nested for loops (e.g making the name a key
and setting it equal to the value or undefined) but to be honest even a problem with
a hundred predicates won't notice the slowdown doing it this way, and it'll save me an hour.
 */
// function label_predicate_parameters(predicate_definitions, predicates) {
//   for(var i = 0; i<predicates.length;i++){
//     for(var j=0; j<predicate_definitions.length;j++) {
//       if(predicates[i].name==predicate_definitions[j].name){
//         for(var k=0;k<predicates[i].parameters.length;k++){
//           predicates[i].parameters[k].name=predicate_definitions[j].parameters[k].name;
//           predicates[i].parameters[k].type=predicate_definitions[j].parameters[k].type;
//         }
//       }
//     }
//   }
// }

function list_action_predicates(action_definitions, action) {
  var result = [];
  //for each action definition
    for(var j=0; j<action_definitions.length;j++) {
      // find the one that matches the current action name
      if(action.name==action_definitions[j].name){
        // for each of this action's parameters, set its name and type
        //NOTE:should make sure parameters exist
        for(var k=0;k<action.parameters.length;k++){
          action.parameters[k].name=action_definitions[j].parameters[k].name;
          action.parameters[k].type=action_definitions[j].parameters[k].type;
        }
        for(var k=0;k<action_definitions[j].effects.length;k++)
        {
          var temp_predicate=JSON.parse(JSON.stringify(action_definitions[j].effects[k]));
          if(typeof(temp_predicate.parameters) != "undefined"){
          for(var x=0;x<temp_predicate.parameters.length;x++)
          {
            for(var y=0;y<action.parameters.length;y++)
              if(action.parameters[y].name==temp_predicate.parameters[x].name)
              { temp_predicate.parameters[x].type=action.parameters[y].type;
                temp_predicate.parameters[x].value=action.parameters[y].value;
              }
          }}
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
 */
function animationEntity(type, content) {
  this.type=type;
  this.content=content;
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
function Argument(name, type, value){
  this.name = name;
  this.value = value;
  this.type = type;
}
