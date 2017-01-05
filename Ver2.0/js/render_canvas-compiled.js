"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var TemplateFactory = function () {
    // static assignment is not supported by babel compiler, thus the factory_instance variable is extracted out here
    var factory_instance = null;

    var Factory = function () {
        function Factory(props) {
            _classCallCheck(this, Factory);

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
        }

        _createClass(Factory, [{
            key: "importSelector",
            value: function importSelector(pattern) {
                this._link = document.querySelector(pattern);
                this._content = this._link.import;
                return this;
            }
        }, {
            key: "importSelectorAll",
            value: function importSelectorAll(pattern) {
                this._link = document.querySelectorAll(pattern);
                var contents = [];
                for (var l in this._link) {
                    contents.push(this._link[l].import);
                }
                this._content = contents;
                return this;
            }
        }, {
            key: "setPrototype",
            value: function setPrototype(pro, type) {
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
                } else if (pro && _type === "text/html") {
                    this._prototype = pro.querySelector(".template");
                    this._prototype.dataContent = this._prototype.querySelector('.template-data').value;
                } else if (pro && pro.dataContent) this._prototype = pro;else if (this._content) {
                    this.setPrototype(this._content, "text/html");
                    // must replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim(); before parsing
                } else throw "No valid prototype available!";
                return this;
            }
        }, {
            key: "newTemplate",
            value: function newTemplate() {
                if (this._prototype) return this._prototype;else if (this._content) {
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
        }, {
            key: "init",
            value: function init() {
                this._prototype = null;
                this._link = null;
                this._content = null;
                return this;
            }
        }]);

        return Factory;
    }();

    ;
    return {
        getInstance: function getInstance(props) {
            return new Factory(props);
        }
    };
}();

var Component = function () {
    function Component(props) {
        _classCallCheck(this, Component);

        var keys = Object.keys(props);
        for (var k in keys) {
            this[keys[k]] = props[keys[k]];
        }
    }

    _createClass(Component, [{
        key: "render",
        value: function render() {
            this.bindClass("selected");
        }
    }, {
        key: "bindClass",
        value: function bindClass(className) {
            if (!className) throw new Error("No Class Name Entered Exception At bindClass Method of Component class!");
            var node = this.node;
            // use a component node to point back to component
            node.component = this;
            // todo add customize content here
            this.customizeContent(node, this.name);
            document.querySelector(this.parentSelector).appendChild(node);

            $(node).click(function () {
                if (!$(this).hasClass(className)) $(this).addClass(className);else $(this).removeClass(className);
            });
        }
    }, {
        key: "parseDom",
        value: function parseDom(str) {
            var parser = new DOMParser();
            str = str.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
            var domPrototype = parser.parseFromString(str, "text/html");
            return domPrototype.body.childNodes[0];
        }
    }, {
        key: "customizeContent",
        value: function customizeContent(node, titl, cont) {
            var title = node.querySelector("p.template-title");
            var content = node.querySelector("p.template-desc");
            if (titl) {
                title.innerHTML = titl;
            } else {
                if (title) title.parentNode.removeChild(title);
            }
            if (cont) {
                content.innerHTML = cont;
            } else {
                if (content) content.parentNode.removeChild(content);
            }
        }
    }, {
        key: "getLogoLink",
        value: function getLogoLink() {
            var obj = JSON.parse(this.node.querySelector("input").value);
            return obj.data.logo;
        }
    }]);

    return Component;
}();

var Model = function (_Component) {
    _inherits(Model, _Component);

    function Model() {
        _classCallCheck(this, Model);

        return _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).apply(this, arguments));
    }

    _createClass(Model, [{
        key: "renderModal",
        value: function renderModal(parentNode) {

            var obj = JSON.parse(this.node.querySelector("input").value);
            var tags = "";
            for (var t in obj.data.domaintags) {
                tags += "<span>" + obj.data.domaintags[t] + "</span>";
            }
            var nodeContent = "<div class='model'>" + "<header><h3 class='modelid'>Model Id: " + this.id + "</h3></header><div class='content'><div class='tags'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" + "<div class='sub_header'><h5>Domain Type: </h5>" + "<span>" + obj.data.domaintype + "</span>" + "</div><div class='sub_header'><h5>Domain Tags: </h5>" + tags + "</div>" + "</div><div class='description'><h5>Description: </h5><p>" + obj.data.domaindescription + "</p></div></div></div>";
            if (parentNode) parentNode.appendChild(nodeContent);else if (this.modalSelector) document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
        }
    }, {
        key: "render",
        value: function render() {
            this.bindClass("selected");
            this.node.addEventListener("dragstart", function (event) {
                console.log("dragstart");
                event.target.className += " dragging";
            }, false);

            var obj = JSON.parse(this.node.querySelector("input").value);

            var offsetWidth = document.querySelector(".side_menu").offsetWidth;
            var offsetHeight = this.node.offsetHeight;

            var _id = this.id;
            this.node.addEventListener("dragend", function (event) {
                console.log("dragend");
                var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
                event.target.className = event.target.className.replace(reg, ' ');

                d3.select(".canvas > svg").append("image").attr("id", _id).classed("drag-ele", true).attr("width", 40).attr("height", 40).attr("href", obj.data.logo).attr("transform", function () {
                    return "translate(" + (event.x - offsetWidth) + "," + (event.y - offsetHeight) + ")";
                }).attr("fill", "#eee");
                d3.select("#" + _id).data([{ x: event.x - offsetWidth, y: event.y - offsetHeight }]).call(drag);
                event.stopPropagation();
            }, false);

            this.node.addEventListener("dragover", function (event) {
                console.log("dragover");
            }, false);
        }
    }]);

    return Model;
}(Component);

var drag = d3.drag().on("drag", function (d, i) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    d3.select(this).attr("transform", function (d, i) {
        return "translate(" + d.x + "," + d.y + ")";
    });
});

//const randomGenerator = function () {
//    var timeStamp = Date.parse(new Date());
//    timeStamp = timeStamp / 1000;
//    // substr(2) can delete first two digit, which are numbers not needed
//    return Math.random().toString(26).substr(2) + timeStamp;
//}

var Action = function (_Component2) {
    _inherits(Action, _Component2);

    function Action() {
        _classCallCheck(this, Action);

        return _possibleConstructorReturn(this, (Action.__proto__ || Object.getPrototypeOf(Action)).apply(this, arguments));
    }

    _createClass(Action, [{
        key: "renderModal",
        value: function renderModal(parentNode) {
            var parameters = "",
                preconditions = "",
                effects = "";
            for (var t in this.data.parameters) {
                parameters += "<span>" + this.data.parameters[t].name + "</span>";
            }

            //for (var t in obj.data.preconditions) {
            //    preconditions += "<span>" + obj.data.preconditions[t].state + "(" + obj.data.preconditions[t].operators.join(",") + "): " +
            //        obj.data.preconditions[t].predicate + "</span>";
            //}

            for (var t in this.data.effects) {
                var args = [];
                for (var k in this.data.effects[t].parameters) {
                    args.push(this.data.effects[t].parameters[k].name);
                }
                effects += "<span>" + this.data.effects[t].name + "(" + args.join(",") + "): " + this.data.effects[t].truthiness + "</span>";
            }

            var nodeContent = "<div class='action'>" + "<header><h3 class='name'>Action Name: " + this.data.name + "</h3></header><div class='content'><div class='tags'>" + "<div class='sub_header'><h5>Parameters: </h5>" + parameters + "</div>" /*<div class='sub_header'><h5>Preconditions: </h5>" + preconditions + "</div>"*/ + "<div class='sub_header'><h5>Effects: </h5>" + effects + "</div>" + "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
            if (parentNode) parentNode.appendChild(nodeContent);else if (this.modalSelector) document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
        }
    }]);

    return Action;
}(Component);

var Predicate = function (_Component3) {
    _inherits(Predicate, _Component3);

    function Predicate() {
        _classCallCheck(this, Predicate);

        return _possibleConstructorReturn(this, (Predicate.__proto__ || Object.getPrototypeOf(Predicate)).apply(this, arguments));
    }

    _createClass(Predicate, [{
        key: "renderModal",
        value: function renderModal(parentNode) {
            var args = [];

            for (var t in this.data.parameters) {
                args.push(this.data.parameters[t].name);
            }

            var predicates = "(" + args.join(",") + ")";

            var nodeContent = "<div class='predicate'>" + "<header><h3 class='name'>Predicate Name: " + this.data.name + "</h3></header>" + "<div class='content'><div class='tags'>" + "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" + "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
            if (parentNode) parentNode.appendChild(nodeContent);else if (this.modalSelector) document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
        }
    }]);

    return Predicate;
}(Component);

var Precondition = function (_Component4) {
    _inherits(Precondition, _Component4);

    function Precondition() {
        _classCallCheck(this, Precondition);

        return _possibleConstructorReturn(this, (Precondition.__proto__ || Object.getPrototypeOf(Precondition)).apply(this, arguments));
    }

    _createClass(Precondition, [{
        key: "renderModal",
        value: function renderModal(parentNode) {
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

            var nodeContent = "<div class='precondition'>" + "<header><h3 class='name'>Precondition " + "<div class='content'><div class='tags'>" + "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" + "<div class='sub_header'><h5>Models: </h5>" + models + "</div>" + "</div><div class='description'><h5>Description: </h5><form action=''>" + "</form></div></div></div>";
            if (parentNode) parentNode.appendChild(nodeContent);else if (this.modalSelector) document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
        }
    }]);

    return Precondition;
}(Component);

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


var Renderer = function () {
    var RendererInstance = function () {
        function RendererInstance() {
            _classCallCheck(this, RendererInstance);
        }

        _createClass(RendererInstance, [{
            key: "addComponent",
            value: function addComponent(key, components) {
                if (!this.components) this.components = {};
                this.components[key] = components;
                return this;
            }
        }, {
            key: "init",
            value: function init() {
                var keys = Object.keys(this.components);
                for (var k in keys) {
                    var group = keys[k];
                    for (var c in this.components[group]) {
                        var q = this.components[group][c].parentSelector;
                        if (q) document.querySelector(q).innerHTML = "";
                    }
                }
                this.render(keys[0]);
                return this;
            }
        }, {
            key: "clear",
            value: function clear(key) {
                if (key) {
                    for (var c in this.components[key]) {
                        var q = this.components[key][c].parentSelector;
                        if (q) document.querySelector(q).innerHTML = "";
                    }
                    return this;
                }

                var keys = Object.keys(this.components);
                for (var k in keys) {
                    var group = keys[k];
                    for (var c in this.components[group]) {
                        var q = this.components[group][c].parentSelector;
                        if (q) document.querySelector(q).innerHTML = "";
                    }
                }
                return this;
            }
        }, {
            key: "render",
            value: function render(key) {
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
        }]);

        return RendererInstance;
    }();

    return {
        getInstance: function getInstance(maps) {
            var renderer = new RendererInstance();
            var keys = Object.keys(maps);
            for (var m in keys) {
                renderer.addComponent(keys[m], maps[keys[m]]);
            }
            return renderer;
        }
    };
}();

var fct = TemplateFactory.getInstance({ importSelector: "#basic_block" });
var template = fct.newTemplate();
var models = [];
for (var i = 0; i < problem[0].names.length; i++) {
    models.push(new Model({
        name: problem[0].names[i],
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
        name: domain[3][i].name,
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
        name: domain[2][i].name,
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true),
        data: domain[2][i]
    }));
}

//fct.importSelector("#basic_precondition").setPrototype();
//template = fct.newTemplate();
//var preconditions = [];
//for (var i = 0; i < 20; i++) {
//    preconditions.push(new Precondition({
//        name: ,
//        parentSelector: '.preload',
//        modalSelector: '.modal > .modal_panel > .modal_content',
//        node: template.cloneNode(true)
//    }));
//}

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
var Animation = function () {

    var colors = ["red", "blue", "purple", "gray", "brown", "green", "skyblue", "black", "silver", "pink", "yellow", "darkgoldenrod"];

    function _register(initials) {
        if (!(initials.length > 0)) throw "Initial states not correct!";else {
            var group = d3.select(".canvas > svg").selectAll("g").data(initials).enter().append("g").attr("class", "group").attr("id", function (d, i) {
                return d.id;
            }).attr("transform", function (d, i) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            // todo adjust text and image setting here
            group.append("image").attr("width", 40).attr("height", 40).attr("href", function (d, i) {
                var obj = JSON.parse(models[i].node.querySelector("input").value);
                return obj.data.logo;
            });
            group.append("text").attr("dx", function (d, i) {
                return 0;
            }).attr("dy", function (d, i) {
                return 60;
            }).text(function (d, i) {
                return models[i].id;
            });
        }
        return this;
    }

    function _play(steps) {
        for (var s in steps) {
            if (steps[s].length > 0) {
                for (var o in steps[s]) {
                    d3.select("#" + steps[s][o].id).transition().attr("transform", function (d, i) {
                        return "translate(" + steps[s][o].x + "," + steps[s][o].y + ")";
                    }).delay(s * 650);
                }
            } else {
                d3.select("#" + steps[s].id).transition().attr("transform", function (d, i) {
                    return "translate(" + steps[s].x + "," + steps[s].y + ")";
                }).delay(s * 650);
            }
        }
        AxisPlayer.play(650);
        return this;
    }

    return {
        register: _register,
        play: _play
    };
}();

var ArgsToIndexMapper = function ArgsToIndexMapper(arg) {
    var mapper = { "?x": 0, "?y": 1, "?z": 2 };
    return mapper[arg];
};

/**
 *  transform raw data to animation objects
 * */
var Transformer = function () {
    var _initialStates = {};
    var _predicates = []; // inherently they are functions that map last state to next state
    var _actions = {};
    var _solutions = []; // store actual solutions objects to represent what is the next pair of coordinates
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
            throw "Arguments Not Correct!";
        }
        for (var p in predicates) {
            // todo add true/false mapping here for func
            // e.g. _predicates[predicates[p].name] = {
            //      "true":func1
            //      "false":func2
            // }
            if (typeof predicates[p].true_func == "function" && typeof predicates[p].false_func == "function") _predicates[predicates[p].name] = {
                "true": predicates[p].true_func,
                "false": predicates[p].false_func
            };else throw "Object in Array of Predicates is not Function";
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
                    x: 500,
                    y: 50
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
                if (b) {
                    var _predicates$init$i$na, _predicates$init$i$na2;

                    if (init[i].truthiness == "true") _initialStates[init[i].args[0]] = (_predicates$init$i$na = _predicates[init[i].name]).true.apply(_predicates$init$i$na, [init[i].args[0]].concat(_toConsumableArray(init[i].args.map(function (p, index) {
                        return _initialStates[init[i].args[index]];
                    }))));else _initialStates[init[i].args[0]] = (_predicates$init$i$na2 = _predicates[init[i].name]).false.apply(_predicates$init$i$na2, [init[i].args[0]].concat(_toConsumableArray(init[i].args.map(function (p, index) {
                        return _initialStates[init[i].args[index]];
                    }))));
                }
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
                args: solutions[s].parameters.map(function (pr) {
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

            var _loop = function _loop() {
                var _predicates$effs$e$na, _predicates$effs$e$na2;

                // specify which parameter should be map to which argument(in index)
                var indices = effs[e].parameters ? effs[e].parameters.map(function (prs) {
                    return ArgsToIndexMapper(prs.name);
                }) : [];

                // 1. map arguments in solution to function in initialStates
                // 2. expand initialStates array as arguments from the 2nd to last at predicate function
                // 3. the first argument of predicate function is object id/name
                if (effs[e].truthiness == "true") stack.push((_predicates$effs$e$na = _predicates[effs[e].name]).true.apply(_predicates$effs$e$na, [_solutions[s].args[0]].concat(_toConsumableArray(_solutions[s].args.map(function (sol, index) {
                    if (indices.length > 0) return _initialStates[_solutions[s].args[indices[index]]];
                    return _initialStates[_solutions[s].args[index]];
                })))));else stack.push((_predicates$effs$e$na2 = _predicates[effs[e].name]).false.apply(_predicates$effs$e$na2, [_solutions[s].args[0]].concat(_toConsumableArray(_solutions[s].args.map(function (sol, index) {
                    if (indices.length > 0) return _initialStates[_solutions[s].args[indices[index]]];
                    return _initialStates[_solutions[s].args[index]];
                })))));
            };

            for (var e in effs) {
                _loop();
            }
            _dataArray.push(stack);
        }
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
    };
}();

var renderInfrastructure = function () {
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
                    var o = problem[1][p];
                    if (o.parameters) init.push({
                        name: o.name,
                        args: o.parameters.map(function (p) {
                            return p.value;
                        }),
                        truthiness: o.truthiness
                    });
                }
                var predicateMappings = [{
                    name: "on",
                    true_func: function true_func(id, o1, o2) {
                        try {
                            return {
                                id: id,
                                x: o2.x,
                                y: o2.y + 30
                            };
                        } catch (err) {
                            throw err;
                        }
                    },
                    false_func: function false_func(id, o1, o2) {
                        try {
                            return {
                                id: id,
                                x: o2.x - 30,
                                y: o2.y - 30
                            };
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "ontable",
                    true_func: function true_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: 250,
                                y: 150
                            };
                        } catch (err) {
                            throw err;
                        }
                    },
                    false_func: function false_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: 300,
                                y: 150
                            };
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "clear",
                    true_func: function true_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x - 80,
                                y: o1.y
                            };
                        } catch (err) {
                            throw err;
                        }
                    },
                    false_func: function false_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x + 80,
                                y: o1.y
                            };
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "handempty",
                    true_func: function true_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x,
                                y: o1.y
                            };
                        } catch (err) {
                            throw err;
                        }
                    },
                    false_func: function false_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: o1.x,
                                y: o1.y
                            };
                        } catch (err) {
                            throw err;
                        }
                    }
                }, {
                    name: "holding",
                    true_func: function true_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: 200,
                                y: 150
                            };
                        } catch (err) {
                            throw err;
                        }
                    },
                    false_func: function false_func(id, o1) {
                        try {
                            return {
                                id: id,
                                x: 200,
                                y: 50
                            };
                        } catch (err) {
                            throw err;
                        }
                    }
                }];
                var trans = Transformer.initiate(predicateMappings, init, solution, domain[3]);
                var anime = Animation.register(trans.getInit());
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
        renderAll: _renderAll
    };
}();

var AxisPlayer = function () {
    var _play = function _play() {
        var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

        $(".element").each(function (i, d) {
            var _this = $(this);
            setTimeout(function () {
                _this.addClass("active");
            }, speed * i);
            setTimeout(function () {
                _this.removeClass("active");
            }, speed * (i + 1));
        });
    };

    return {
        play: _play
    };
}();

renderInfrastructure.renderAll();

// modules loading
var maps = { "models": models, "actions": actions, "predicates": predicates /*"preconditions": preconditions*/ };
var renderer = Renderer.getInstance(maps);
renderer.init();

//# sourceMappingURL=render_canvas-compiled.js.map