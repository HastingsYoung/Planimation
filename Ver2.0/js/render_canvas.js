var array = localStorage.getItem('file_container');
if (!array) {
    alert("Please Load Requisite Files Before Entering This Page!");
    window.location.href = "../index.html";
}
array = JSON.parse(array);

var domain = PDDL_Parser.parse(array[0]);
console.log(domain);
var problem = PDDL_Parser.parse(array[1]);
console.log(problem);
var solution = Plan_Parser.parse(array[2]);
console.log(solution);

/**
 *  A Singleton Factory responsible for generating template files.
 *  1. Promise Style.
 *  2. Usage:
 *      A - import:
 *      var fct = TemplateFactory.getInstance({
 *      importSelector: "#block",   // optionally, use importSelectorAll, which imports all relevant elements on the page
 *      });
 *      B - prototype:
 *      var fct = TemplateFactory.getInstance();
 *      fct.setPrototype(pro, "text/html");     // where pro is a string or a DOM object either in variable form or as an array
 *      C - get template:
 *      var temp = fct.newTemplate().cloneNode(true);   // if cloneNode is not used, the template would be identical last generation
 * */
var TemplateFactory = (function () {
// static assignment is not supported by babel compiler, thus the factory_instance variable is extracted out here
    let factory_instance = null;
    class Factory {
        constructor(props) {
            if (!factory_instance) {
                if (props) {
                    var keys = Object.keys(props);
                    for (var k in keys) {
                        if (this[keys[k]]) {
                            this[keys[k]](props[keys[k]]);
                        }
                    }
                }
                factory_instance = this;
            }
            return factory_instance;
        };

        importSelector(pattern) {
            this._link = document.querySelector(pattern);
            this._content = this._link.import;
            return this;
        }

        importSelectorAll(pattern) {
            this._link = document.querySelectorAll(pattern);
            var contents = [];
            for (var l in this._link) {
                contents.push(this._link[l].import);
            }
            this._content = contents;
            return this;
        }

        setPrototype(pro, type) {
            var _type = type ? type : "text/html";
            if (typeof pro == "string") {
                pro = pro.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
                var parser = new DOMParser();
                var domPrototype = parser.parseFromString(pro, _type);
                this._contentType = _type;
                if (_type === "text/html") {
                    this._prototype = domPrototype.querySelector(".template");
                    this._prototype.dataContent = this._prototype.querySelector('.template-data').value;
                } else {
                    this._prototype = domPrototype;
                }
            } else if (pro && pro.length > 1) {
                var parser = new DOMParser();
                var domPrototype = [];
                for (var p in pro) {
                    domPrototype.push(parser.parseFromString(pro[p], _type));
                }
                ;
                this._contentType = _type;
                if (_type === "text/html") {
                    this._prototype = domPrototype.querySelector(".template");
                    this._prototype.dataContent = this._prototype.querySelector('.template-data').value;
                } else if (pro.dataContent) {
                    // the code of bulk reading hasn't been corrected, will do this later
                    this._prototype = domPrototype;
                    this._prototype.dataContent = pro.dataContent;
                } else {
                    throw new Error("Cannot initiate a prototype without a data!");
                }
            } else if (pro && (_type === "text/html")) {
                this._prototype = pro.querySelector(".template");
                this._prototype.dataContent = this._prototype.querySelector('.template-data').value;
            }
            else if (pro && pro.dataContent)
                this._prototype = pro;
            else if (this._content) {
                this.setPrototype(this._content, "text/html");
                // must replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim(); before parsing
            } else
                throw "No valid prototype available!";
            return this;
        }

        newTemplate() {
            if (this._prototype)
                return this._prototype;
            else if (this._content) {
                if (typeof this._content === "string" && this._contentType === "text/html") {
                    this.setPrototype(this._content);
                } else if (this._content.length > 1) {
                    var prototypes = [];
                    for (var c in this._content) {
                        prototypes.push(this._content[c]);
                    }
                    this.setPrototype(prototypes);
                } else {
                    this.setPrototype(this._content, this._contentType);
                }
                return this._prototype;
            }
            throw "Prototype not defined!";
        }

        init() {
            this._prototype = null;
            this._link = null;
            this._content = null;
            return this;
        }
    }
    ;
    return {
        getInstance: function (props) {
            return new Factory(props);
        },
    };
}());

class Component {
    constructor(props) {
        var keys = Object.keys(props);
        for (var k in keys) {
            this[keys[k]] = props[keys[k]];
        }
    }

    render() {
        this.bindClass("selected");
    }

    bindClass(className) {
        if (!className)
            throw new Error("No class name entered!");
        var node = this.node;
        node.component = this;
        document.querySelector(this.parentSelector).appendChild(node);
        $(node).click(function () {
            if (!$(this).hasClass(className))
                $(this).addClass(className);
            else
                $(this).removeClass(className);
        });
    }

    parseDom(str) {
        var parser = new DOMParser();
        str = str.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
        var domPrototype = parser.parseFromString(str, "text/html");
        return domPrototype.body.childNodes[0];
    }

    getLogoLink() {
        var obj = JSON.parse(this.node.querySelector("input").value);
        return obj.data.logo;
    }
}

class Model extends Component {

    renderModal(parentNode) {

        var obj = JSON.parse(this.node.querySelector("input").value);
        var tags = "";
        for (var t in obj.data.domaintags) {
            tags += "<span>" + obj.data.domaintags[t] + "</span>";
        }
        var nodeContent = "<div class='model'>" +
            "<header><h3 class='modelid'>Model Id: " + this.id +
            "</h3></header><div class='content'><div class='tags'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" +
            "<div class='sub_header'><h5>Domain Type: </h5>" + "<span>" + obj.data.domaintype + "</span>" +
            "</div><div class='sub_header'><h5>Domain Tags: </h5>" + tags + "</div>" +
            "</div><div class='description'><h5>Description: </h5><p>" + obj.data.domaindescription + "</p></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
    }

    render() {
        this.bindClass("selected");
        this.node.addEventListener("dragstart", function (event) {
            console.log("dragstart");
            event.target.className += " dragging";
        }, false);

        var obj = JSON.parse(this.node.querySelector("input").value);

        const offsetWidth = document.querySelector(".side_menu").offsetWidth;
        const offsetHeight = this.node.offsetHeight;

        const _id = this.id;

        // random generator
        //console.log(randomGenerator());

        this.node.addEventListener("dragend", function (event) {
            console.log("dragend");
            var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
            event.target.className = event.target.className.replace(reg, ' ');

            d3.select(".canvas > svg").append("image").attr("id", _id).classed("drag-ele", true).attr("width", 40).attr("height", 40).attr("href", obj.data.logo).attr("transform", function () {
                return "translate(" + (event.x - offsetWidth) + "," + (event.y - offsetHeight) + ")";
            }).attr("fill", "#eee");
            d3.select("#" + _id).data([{x: event.x - offsetWidth, y: event.y - offsetHeight}]).call(drag);
            event.stopPropagation();
        }, false);

        this.node.addEventListener("dragover", function (event) {
            console.log("dragover");
        }, false);
    }
}

var drag = d3.drag().on("drag", function (d, i) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    d3.select(this).attr("transform", function (d, i) {
        return "translate(" + d.x + "," + d.y + ")";
    });
});

const randomGenerator = function () {
    var timeStamp = Date.parse(new Date());
    timeStamp = timeStamp / 1000;
    // substr(2) can delete first two digit, which are numbers not needed
    return Math.random().toString(26).substr(2) + timeStamp;
}

class Action extends Component {
    renderModal(parentNode) {
        var parameters = "", preconditions = "", effects = "";
        for (var t in this.data.parameters) {
            parameters += "<span>" + this.data.parameters[t].name + "</span>";
        }

        //for (var t in obj.data.preconditions) {
        //    preconditions += "<span>" + obj.data.preconditions[t].state + "(" + obj.data.preconditions[t].operators.join(",") + "): " +
        //        obj.data.preconditions[t].predicate + "</span>";
        //}

        for (var t in this.data.effects) {
            let args = [];
            for (var k in this.data.effects[t].parameters) {
                args.push(this.data.effects[t].parameters[k].name);
            }
            effects += "<span>" + this.data.effects[t].name + "(" + args.join(",") + "): " +
                this.data.effects[t].truthiness + "</span>";
        }

        var nodeContent = "<div class='action'>" +
            "<header><h3 class='name'>Action Name: " + this.data.name +
            "</h3></header><div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Parameters: </h5>" + parameters +
            "</div>"/*<div class='sub_header'><h5>Preconditions: </h5>" + preconditions + "</div>"*/ +
            "<div class='sub_header'><h5>Effects: </h5>" + effects + "</div>" +
            "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
    }
}


class Predicate extends Component {
    renderModal(parentNode) {
        var args = []

        for (var t in this.data.parameters) {
            args.push(this.data.parameters[t].name);
        }

        var predicates = "(" + args.join(",") + ")";

        var nodeContent = "<div class='predicate'>" + "<header><h3 class='name'>Predicate Name: " + this.data.name +
            "</h3></header>" + "<div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" +
            "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
    }
}

class Precondition extends Component {
    renderModal(parentNode) {
        var obj = JSON.parse(this.node.querySelector("input").value);
        var predicates = "";

        /**
         * temporarily use 0, should iterate through preconditions later
         * */
        for (var t in obj.data.preconditions[0].predicates) {
            predicates += "<span>" + obj.data.preconditions[0].predicates[t].state + "(" + obj.data.preconditions[0].predicates[t].operators.join(",") + "): " + obj.data.preconditions[0].predicates[t].predicate + "</span>";
        }

        var models = "";
        for (var t in obj.data.preconditions[0].models) {
            models += "<span>" + obj.data.preconditions[0].models[t].model + "[" + obj.data.preconditions[0].models[t].location.join(",") + "]" + "</span>";
        }

        var nodeContent = "<div class='precondition'>" +
            "<header><h3 class='name'>Precondition " +
            "<div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" +
            "<div class='sub_header'><h5>Models: </h5>" + models + "</div>" +
            "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
    }
}

/**
 *  Page Renderer.
 *  1. Promise Style.
 *  2. Usage:
 *      A - add component:
 *          var renderer =  Renderer.getInstance({
 *          key1: component1
 *          key2: component2
 *          key3: component3
 *          // ...
 *          }).init();
 *
 *      B - clear components:
 *          renderer.clear();
 *
 *      C - render component with specific key:
 *          renderer.render(key);
 *
 * */
var Renderer = (function () {
    class RendererInstance {
        constructor() {
        }

        addComponent(key, components) {
            if (!this.components)
                this.components = {};
            this.components[key] = components;
            return this;
        }

        init() {
            var keys = Object.keys(this.components);
            for (var k in keys) {
                var group = keys[k];
                for (var c in this.components[group]) {
                    var q = this.components[group][c].parentSelector;
                    if (q)
                        document.querySelector(q).innerHTML = "";
                }
            }
            this.render(keys[0]);
            return this;
        }

        clear(key) {
            if (key) {
                for (var c in this.components[key]) {
                    var q = this.components[key][c].parentSelector;
                    if (q)
                        document.querySelector(q).innerHTML = "";
                }
                return this;
            }

            var keys = Object.keys(this.components);
            for (var k in keys) {
                var group = keys[k];
                for (var c in this.components[group]) {
                    var q = this.components[group][c].parentSelector;
                    if (q)
                        document.querySelector(q).innerHTML = "";
                }
            }
            return this;
        }

        render(key) {
            if (key) {
                for (var c in this.components[key]) {
                    this.components[key][c].render();
                }
                return this;
            }

            var keys = Object.keys(this.components);
            for (var k in keys) {
                var group = keys[k];
                for (var c in this.components[group]) {
                    this.components[group][c].render();
                }
            }
            return this;
        }
    }

    return {
        getInstance: function (maps) {
            var renderer = new RendererInstance();
            var keys = Object.keys(maps);
            for (var m in keys) {
                renderer.addComponent(keys[m], maps[keys[m]]);
            }
            return renderer;
        }
    }
}());

var fct = TemplateFactory.getInstance({importSelector: "#basic_block"});
var template = fct.newTemplate();
var models = [];
for (var i = 0; i < problem[0].names.length; i++) {
    models.push(new Model({
        name: 'block',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        id: "block-" + problem[0].names[i],
        node: template.cloneNode(true)
    }));
}

fct.importSelector("#basic_action").setPrototype();
template = fct.newTemplate();
var actions = [];
for (var i in domain[3]) {
    actions.push(new Action({
        name: 'action',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true),
        data: domain[3][i]
    }));
}

fct.importSelector("#basic_predicate").setPrototype();
template = fct.newTemplate();
var predicates = [];
for (var i in domain[2]) {
    predicates.push(new Predicate({
        name: 'predicate',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true),
        data: domain[2][i]
    }));
}

fct.importSelector("#basic_precondition").setPrototype();
template = fct.newTemplate();
var preconditions = [];
for (var i = 0; i < 20; i++) {
    preconditions.push(new Precondition({
        name: 'precondition',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true)
    }));
}

/**
 *  @steps animation data
 *  #example
 *  steps = [{
 *      id: "objId",
 *      x: "objX",
 *      y: "objY"
 *  },{
 *      id: "objId",
 *      x: "objX",
 *      y: "objY"
 *  },[{
 *      id: "objId",
 *      x: "objX",
 *      y: "objY"
 *  },{
 *      id: "objId",
 *      x: "objX",
 *      y: "objY"
 *  }]]
 * */
var Animation = (function () {

    var colors = ["red", "blue", "purple", "gray", "brown", "green", "skyblue", "black", "silver", "pink", "yellow", "darkgoldenrod"]

    function _register(initials) {
        if (!(initials.length > 0))
            throw "Initial states not correct!";
        else
            d3.select(".canvas > svg").selectAll("circle").data(initials).enter().append("circle").attr("r", 10).attr("id", function (d, i) {
                return d.id;
            }).style("fill", function (d, i) {
                return colors[i];
            }).attr("transform", function (d, i) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        return this;
    }

    function _play(steps) {
        for (var s in steps) {
            if (steps[s].length > 0) {
                for (var o in steps[s]) {
                    d3.select("#" + steps[s][o].id).transition().attr("transform", function (d, i) {
                        return "translate(" + steps[s][o].x + "," + steps[s][o].y + ")";
                    }).delay(s * 500);
                }
            } else {
                d3.select("#" + steps[s].id).transition().attr("transform", function (d, i) {
                    return "translate(" + steps[s].x + "," + steps[s].y + ")";
                }).delay(s * 500);
            }
        }
        return this;
    }

    return {
        register: _register,
        play: _play
    }
}());

const ArgsToIndexMapper = (arg)=> {
    const mapper = {"?x": 0, "?y": 1, "?z": 2};
    return mapper[arg];
}

/**
 *  transform raw data to animation objects
 * */
var Transformer = (function () {
    var _initialStates = {};
    var _predicates = [];    // inherently they are functions that map last state to next state
    var _actions = {};
    var _solutions = [];   // store actual solutions objects to represent what is the next pair of coordinates
    var _dataArray = [];

    /**
     * @predicates domain[2].map((o)=>{
     *      return {
     *          name: o.name,
     *          // get coordinates of id from o1 and o2
     *          func: function(id,o1,o2){
     *              return {
     *                  id: id,
     *                  x: o1.x + o2.x,
     *                  y: o1.y - 10
     *              }
     *          }
     *      }
     * })
     * @init var init = problem[1].map((o)=> {
     *              if (o.parameters)
     *                  return {
     *                      name: o.name,
     *                      args: o.parameters.map((p)=>{
     *                          return p.value;
     *                      })
     *                  }
     *          });
     * @solutions solutions
     * */
    function _initiate(predicates, init, solutions, actions) {
        if (!init || !solutions || !predicates || !actions) {
            throw "Arguments Not Correct!"
        }
        for (var p in predicates) {
            // todo add true/false mapping here for func
            // e.g. _predicates[predicates[p].name] = {
            //      "true":func1
            //      "false":func2
            // }
            if (typeof predicates[p].func == "function")
                _predicates[predicates[p].name] = predicates[p].func;
            else
                throw "Object in Array of Predicates is not Function";
        }

        for (var a in actions) {
            _actions[actions[a].name] = {
                name: actions[a].name,
                effects: actions[a].effects
            };
        }

        // base cases
        for (var i in init) {
            if (init[i].args.length == 1) {
                _initialStates[init[i].args[0]] = {
                    id: init[i].args[0],
                    x: 200,
                    y: 200
                };
            }
        }
        // derivative cases
        var loopStack = [];
        for (var i in init) {
            if (init[i].args.length > 1) {
                var b = true;
                /** as the input order of arguments are now in dependent order, we don't need a loopStack to handle non-existence dependencies
                 * but would be useful later ⤵
                 */
                for (var arg = 1; arg < init[i].args.length; arg++) {
                    // if any dependent argument does not exist(the first one is variable to be calculated)
                    if (!_initialStates[init[i].args[arg]]) {
                        loopStack.push({
                            args: init[i].args,
                            name: init[i].name
                        });
                        b = false;
                        break;
                    }
                }
                // if every dependencies is able to be found, set a mapping between first argument and its dependencies
                if (b)
                    _initialStates[init[i].args[0]] = _predicates[init[i].name](init[i].args[0], ...(init[i].args.map((p, index)=> {
                        return _initialStates[init[i].args[index]];
                    })));
            }
        }
        /** as the input order of arguments are now in dependent order, we don't need a loopStack to handle non-existence dependencies
         * but would be useful later ⤵
         */

        //while (loopStack.length > 0) {
        //    var obj = loopStack.pop();
        //    var t = true;
        //    for (var a = 1; a < obj.args.length; a++) {
        //        if (!_initialStates[obj.args[a]]) {
        //            loopStack.push({
        //                args: obj.args,
        //                name: obj.name
        //            });
        //            t = false;
        //            break;
        //        }
        //    }
        //    if (t)
        //        _initialStates[args[0]] = _predicates[obj.name](obj.args[0], _initialStates[obj.args[1]]);
        //}

        for (var s in solutions) {
            _solutions.push({
                name: solutions[s].name,
                args: solutions[s].parameters.map((pr)=> {
                    return pr.value;
                })
            });
        }
        return this;
    }

    function _transform() {
        // transform...
        for (var s in _solutions) {
            var effs = _actions[_solutions[s].name].effects;
            var stack = [];
            for (var e in effs) {
                // specify which parameter should be map to which argument(in index)
                let indices = effs[e].parameters ? effs[e].parameters.map((prs)=>(ArgsToIndexMapper(prs.name))) : [];

                // 1. map arguments in solution to function in initialStates
                // 2. expand initialStates array as arguments from the 2nd to last at predicate function
                // 3. the first argument of predicate function is object id/name
                // todo: add true/false mapping for predicates here
                stack.push(_predicates[effs[e].name](_solutions[s].args[0], ...(_solutions[s].args.map((sol, index)=> {
                    if (indices.length > 0)
                        return _initialStates[_solutions[s].args[indices[index]]];
                    return _initialStates[_solutions[s].args[index]];
                }))));
            }
            _dataArray.push(stack);
        }
        console.log(_dataArray);
        return _dataArray;
    }

    function _getInitialStates() {
        var array = [];
        for (var i in _initialStates) {
            array.push(_initialStates[i]);
        }
        return array;
    }

    return {
        getInit: _getInitialStates,
        initiate: _initiate,
        transform: _transform
    }
}());

var renderInfrastructure = (function () {
    function _renderTab() {
        $(".tab").each(function () {
            var _this = $(this);
            _this.on("click", function () {
                renderer.clear();
                renderer.render(_this.attr('id'));
                _this.addClass("active");
                _this.siblings().each(function () {
                    $(this).removeClass("active");
                });
            });
        });
    }

    function _renderCanvas() {
        var svg = d3.select(".canvas").append("svg").attr("width", 1100).attr("height", 650);
        document.querySelector(".canvas > svg").addEventListener("drop", function () {
            console.log("drop");
        }, false);
    }

    function _renderButtons() {
        $(".btn.edit").each(function () {
            $(this).click(function () {
                $(".modal").addClass("active");
                document.querySelector(".modal > .modal_panel > .modal_content").innerHTML = "";
                document.querySelector(".template.selected").component.renderModal();
            });
        });
        $(".btn.start").each(function () {
            $(this).click(function () {
                //const initials = [{
                //    id: "a-1",
                //    x: 50,
                //    y: 50
                //}, {
                //    id: "a-2",
                //    x: 50,
                //    y: 100
                //}, {
                //    id: "a-3",
                //    x: 50,
                //    y: 150
                //}];
                //
                //const steps = [{
                //    id: "a-1",
                //    x: 100,
                //    y: 50
                //}, [{
                //    id: "a-1",
                //    x: 150,
                //    y: 50
                //}, {
                //    id: "a-2",
                //    x: 150,
                //    y: 100
                //}], [{
                //    id: "a-1",
                //    x: 200,
                //    y: 50
                //}, {
                //    id: "a-2",
                //    x: 200,
                //    y: 100
                //}, {
                //    id: "a-3",
                //    x: 200,
                //    y: 150
                //}]];
                var init = [];
                for (var p in problem[1]) {
                    let o = problem[1][p];
                    if (o.parameters)
                        init.push({
                            name: o.name,
                            args: o.parameters.map((p)=> {
                                return p.value;
                            })
                        });
                }
                const predicateMappings = [{
                    name: "on",
                    func: function (id, o1, o2) {
                        try {
                            return {
                                id: id,
                                x: o2.x,
                                y: o2.y + 20
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "ontable",
                    func: function (id, o1) {
                        try {
                            return {
                                id: id,
                                x: 300,
                                y: 100
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "clear",
                    func: function (id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x - 50,
                                y: o1.y
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "handempty",
                    func: function (id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x,
                                y: o1.y
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "holding",
                    func: function (id, o1) {
                        try {
                            return {
                                id: id,
                                x: 300,
                                y: 200
                            }
                        } catch (err) {
                            throw err;
                        }
                    }
                }];
                let trans = Transformer.initiate(predicateMappings, init, solution, domain[3]);
                console.log(trans.getInit());
                let anime = Animation.register(trans.getInit());
                anime.play(trans.transform());
                //let anime = Animation.register(initials);
                //anime.play(steps);
            });
        });
    }

    function _renderModal() {
        $(".btn__close").click(function () {
            $(".modal").removeClass("active");
        });
    }

    function _renderFrames() {
        for (var s in solution) {
            var ele = $("<div class='element' data-state='" + s + "'><label class='number'>" + s + "</label><p>" + solution[s].name + "</p></div>");
            $(".axis").append(ele);
            ele.click(function () {
                $(this).addClass("active");
                $(this).siblings().each(function () {
                    $(this).removeClass("active");
                });
            });
        }
    }

    function _renderAll() {
        _renderCanvas();
        _renderTab();
        _renderFrames();
        _renderButtons();
        _renderModal();
    }

    return {
        renderTab: _renderTab,
        renderCanvas: _renderCanvas,
        renderFrames: _renderFrames,
        renderButtons: _renderButtons,
        renderModal: _renderModal,
        renderAll: _renderAll,
    };
}());

renderInfrastructure.renderAll();

// modules loading
var maps = {"models": models, "actions": actions, "predicates": predicates, "preconditions": preconditions};
var renderer = Renderer.getInstance(maps);
renderer.init();