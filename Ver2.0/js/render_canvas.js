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
        var nodeContent = "<div class='domain'>" +
            "<header><h3 class='domainid'>Domain Id: " + obj.data.domainid +
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
        var _node = this.node;
        this.node.addEventListener("dragstart", function (event) {
            console.log("dragstart");
            console.log(event);
            event.target.className += " dragging";
            //event.preventDefault();
            // record its location on canvas
        },false);

        this.node.addEventListener("dragend", function (event) {
            console.log("dragend");
            var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
            event.target.className = event.target.className.replace(reg,' ');

            // get its location on canvas
            d3.select(".canvas > svg").append("image").attr("width", 40).attr("height", 40).attr("x", event.x-300).attr("y", event.y-50).attr("href", "imgs/block.png");
            event.stopPropagation();
        },false);

        this.node.addEventListener("dragover", function (event) {
            console.log("dragover");
        },false);
    }
}

class Action extends Component {
    renderModal(parentNode) {
        var obj = JSON.parse(this.node.querySelector("input").value);
        var parameters = "", preconditions = "", effects = "";
        for (var t in obj.data.parameters) {
            parameters += "<span>" + obj.data.parameters[t] + "</span>";
        }

        for (var t in obj.data.preconditions) {
            preconditions += "<span>" + obj.data.preconditions[t].state + "(" + obj.data.preconditions[t].operators.join(",") + "): " +
                obj.data.preconditions[t].predicate + "</span>";
        }

        for (var t in obj.data.effects) {
            effects += "<span>" + obj.data.effects[t].state + "(" + obj.data.effects[t].operators.join(",") + "): " +
                obj.data.effects[t].predicate + "</span>";
        }

        var nodeContent = "<div class='action'>" +
            "<header><h3 class='name'>Action Name: " + obj.data.name +
            "</h3></header><div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Parameters: </h5>" + parameters +
            "</div><div class='sub_header'><h5>Preconditions: </h5>" + preconditions + "</div>" +
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
        var obj = JSON.parse(this.node.querySelector("input").value);
        var rules = "";

        for (var t in obj.data.rules) {
            rules += "<span>" + obj.data.rules[t].state + "(" + obj.data.rules[t].operators.join(",") + "): [default]" +
                obj.data.rules[t].default + "</span>";
        }

        var nodeContent = "<div class='predicate'>" +
            "<div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Rules: </h5>" + rules + "</div>" +
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
for (var i = 0; i < 30; i++) {
    models.push(new Model({
        name: 'block',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true)
    }));
}

fct.importSelector("#basic_action").setPrototype();
template = fct.newTemplate();
var actions = [];
for (var i = 0; i < 20; i++) {
    actions.push(new Action({
        name: 'action',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true)
    }));
}

fct.importSelector("#basic_predicate").setPrototype();
template = fct.newTemplate();
var predicates = [];
for (var i = 0; i < 20; i++) {
    predicates.push(new Predicate({
        name: 'predicate',
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true)
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
        var svg = d3.select(".canvas").append("svg").attr("width", 900).attr("height", 900);
    }

    function _renderButtons() {
        $(".btn").each(function () {
            $(this).click(function () {
                $(".modal").addClass("active");
                document.querySelector(".modal > .modal_panel > .modal_content").innerHTML = "";
                document.querySelector(".template.selected").component.renderModal();
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