"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var animationFuncs = [];

// blocks
var blocksWorldMappings = [{
    name: "on",
    true_func: function true_func(id, o1, o2) {
        return {
            id: id,
            x: o2.x,
            y: o2.y + 60
        };
    },
    false_func: function false_func(id, o1, o2) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    }
}, {
    name: "ontable",
    true_func: function true_func(id, o1) {
        return {
            id: id,
            x: 150 + Math.random() * 100,
            y: 150 + Math.random() * 100
        };
    },
    false_func: function false_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    }
}, {
    name: "clear",
    true_func: function true_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    },
    false_func: function false_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    }
}, {
    name: "handempty",
    true_func: function true_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    },
    false_func: function false_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    }
}, {
    name: "holding",
    true_func: function true_func(id, o1) {
        return {
            id: id,
            x: 620,
            y: 220
        };
    },
    false_func: function false_func(id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        };
    }
}];

var domainMappings = {
    "BLOCKSWORLD": blocksWorldMappings
};

var selectMapping = function selectMapping(domain) {
    return domainMappings[domain.toUpperCase()];
};

var initialMappings = [];
initialMappings = selectMapping("blocksworld");

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

/**
 *  Components to be shown and operated on.
 *  @render() render component to tabs
 *  @resetClass() reset class name bound to component
 *  @parseDom() parse string as DOM element
 * */

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
        key: "resetClass",
        value: function resetClass(className) {
            if (className) {
                $(this.node).removeClass(className);
                $(this.node).off("click");
                return;
            }
            $(this.node).removeClass("selected");
            $(this.node).off("click");
        }
    }, {
        key: "bindClass",
        value: function bindClass(className) {
            if (!className) throw new Error("No Class Name Entered Exception At 'bindClass' Method of Component class!");
            var node = this.node;
            // use a component node to point back to component
            node.component = this;
            this.customizeContent(node, this.name);
            document.querySelector(this.parentSelector).appendChild(node);

            $(node).click(function () {
                if (!$(this).hasClass(className)) {
                    $(this).siblings().each(function () {
                        $(this).removeClass(className);
                    });
                    $(this).addClass(className);
                }
                // do not allow removing click
                //else
                //    $(this).removeClass(className);
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

    function Model(props) {
        _classCallCheck(this, Model);

        var _this2 = _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this, props));

        _this2.obj = JSON.parse(_this2.node.querySelector("input").value);
        return _this2;
    }

    _createClass(Model, [{
        key: "renderModal",
        value: function renderModal(parentNode) {

            var obj = this.obj;
            var tags = "";
            for (var t in obj.data.domaintags) {
                tags += "<span>" + obj.data.domaintags[t] + "</span>";
            }
            var nodeContent = "<div class='model'>" + "<header><h3 class='modelid'>Model Id: " + this.id + "</h3></header><div class='content'><div class='tags'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" + "<div class='sub_header'><h5>Domain Type: </h5>" + "<span>" + obj.data.domaintype + "</span>" + "</div><div class='sub_header'><h5>Domain Tags: </h5>" + tags + "</div>" + "</div><div class='description'><h5>Description: </h5><p>" + obj.data.domaindescription + "</p></div></div>" + "<span class='modal-btns'><div class='file-upload-btn'><input type='file'/><span><i class='fa fa-cloud-upload'></i>Upload</span></div></span></div>";
            var _this = this;
            if (parentNode) {
                parentNode.appendChild(nodeContent);
                parentNode.querySelector("input").addEventListener("change", function (evt) {
                    previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                        _this.obj.data.logo = imgLink;
                    });
                    previewImage(parentNode.querySelector("img"), evt.target.files[0]);
                });
            } else if (this.modalSelector) {
                document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
                document.querySelector(this.modalSelector).querySelector("input").addEventListener("change", function (evt) {
                    previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                        _this.obj.data.logo = imgLink;
                    });
                    previewImage(document.querySelector(_this.modalSelector).querySelector("img"), evt.target.files[0]);
                });
            }
        }
    }, {
        key: "render",
        value: function render() {
            this.bindClass("selected");
            //this.node.addEventListener("dragstart", function (event) {
            //    console.log("dragstart");
            //    event.target.className += " dragging";
            //}, false);
            //
            //var obj = this.obj;

            //const offsetWidth = document.querySelector(".side_menu").offsetWidth;
            //const offsetHeight = this.node.offsetHeight;

            //const _id = this.id;
            //this.node.addEventListener("dragend", function (event) {
            //    console.log("dragend");
            //    var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
            //    event.target.className = event.target.className.replace(reg, ' ');
            //
            //    d3.select(".canvas > svg").append("image").attr("id", _id).classed("drag-ele", true).attr("width", 40).attr("height", 40).attr("href", obj.data.logo).attr("transform", function () {
            //        return "translate(" + (event.x - offsetWidth) + "," + (event.y - offsetHeight) + ")";
            //    }).attr("fill", "#eee");
            //    d3.select("#" + _id).data([{x: event.x - offsetWidth, y: event.y - offsetHeight}]).call(drag);
            //    event.stopPropagation();
            //}, false);
            //
            //this.node.addEventListener("dragover", function (event) {
            //    console.log("dragover");
            //}, false);
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

            var nodeContent = "<div class='action'>" + "<header><h3 class='name'>Action Name: " + this.data.name + "</h3></header><div class='content'><div class='tags'>" + "<div class='sub_header'><h5>Parameters: </h5>" + parameters + "</div>" /*<div class='sub_header'><h5>Preconditions: </h5>" + preconditions + "</div>"*/ + "<div class='sub_header'><h5>Effects: </h5>" + effects + "</div>" + "</div><div class='description'><h5>Description: </h5><p>Action description...</p></div></div></div>";
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

            var nodeContent = "<div class='predicate'>" + "<header><h3 class='name'>Predicate Name: " + this.data.name + "</h3></header>" + "<div class='content'><div class='tags'>" + "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" + "<span><label><i class='fa fa-plus-square fa-2x' aria-hidden='true'></i></label><input class='predicate-true' placeholder='True Condition'/></span>" + "<span><label><i class='fa fa-minus-square fa-2x' aria-hidden='true'></i></label><input class='predicate-false' placeholder='False Condition' /></span><span class='modal-btns'>" + "<button id='modal-predicate-confirm' class='btn-confirm'>Confirm</button><button class='btn-cancel'>Cancel</button></span>" + "</div><div class='modal-divider'></div><div class='description'><h4>Example</h4>" + "<p>If we've got variable (?a,?b) then the input should be x:a.x+b.x+10;y:a.y*10-b.y</p></div></div></div>";
            if (parentNode) parentNode.appendChild(nodeContent);else if (this.modalSelector) document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
            var _this = this;
            $("#modal-predicate-confirm").click(function () {
                var tValue = $(".predicate-true").val();
                var fValue = $(".predicate-false").val();
                var arrT = tValue.trim().split(";");
                var arrF = fValue.trim().split(";");
                var arrXT = arrT[0].split(":");
                var arrYT = arrT[1].split(":");
                var arrXF = arrF[0].split(":");
                var arrYF = arrF[1].split(":");
                var funcBodyT = "(function(id," + args.join(",").replace(/\?/g, "") + "){return {id:id,'x':" + arrXT[1] + ",'y':" + arrYT[1] + "}})";
                var funcBodyF = "(function(id," + args.join(",").replace(/\?/g, "") + "){return {id:id,'x':" + arrXF[1] + ",'y':" + arrYF[1] + "}})";
                animationFuncs.push({
                    name: _this.data.name,
                    true_func: eval(funcBodyT),
                    false_func: eval(funcBodyF)
                });
                console.log(animationFuncs);
                $(".modal").removeClass("active");
            });
        }
    }]);

    return Predicate;
}(Component);

var Images = function (_Component4) {
    _inherits(Images, _Component4);

    function Images(props) {
        _classCallCheck(this, Images);

        var _this5 = _possibleConstructorReturn(this, (Images.__proto__ || Object.getPrototypeOf(Images)).call(this, props));

        _this5.obj = JSON.parse(_this5.node.querySelector("input").value);
        return _this5;
    }

    _createClass(Images, [{
        key: "renderModal",
        value: function renderModal(parentNode) {

            var obj = this.obj;
            var nodeContent = "<div class='model'>" + "<header><h3 class='modelid'>Image Id: " + this.id + "</h3></header><div class='content'><div class='content-left'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" + "<span class='modal-btns'>" + "<div class='file-upload-btn modal-btn'><input type='file'/><span>Upload</span></div></span></div><div class='modal-divider'></div>" + "<div class='content-right'>" + "<span><label><i class='fa fa-arrows-h' aria-hidden='true'></i></label><input id='image-width' type='text' placeholder='Image Width'></span>" + "<span><label><i class='fa fa-arrows-v' aria-hidden='true'></i></label><input id='image-height' type='text' placeholder='Image Height'></span>" + "<span class='modal-btns'><button id='modal-image-confirm'>Confirm</button></span></div></div></div>";
            var _this = this;
            if (parentNode) {
                parentNode.appendChild(nodeContent);
                parentNode.querySelector("input").addEventListener("change", function (evt) {
                    previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                        _this.obj.data.logo = imgLink;
                    });
                    previewImage(parentNode.querySelector("img"), evt.target.files[0]);
                });
            } else if (this.modalSelector) {
                document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
                document.querySelector(this.modalSelector).querySelector("input").addEventListener("change", function (evt) {
                    previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                        _this.obj.data.logo = imgLink;
                    });
                    previewImage(document.querySelector(_this.modalSelector).querySelector("img"), evt.target.files[0]);
                });
            }
            $("#modal-image-confirm").click(function () {
                var width = $("#image-width").val();
                var height = $("#image-height").val();
                if (checkNum(width) && checkNum(height)) {
                    _this.obj.data.width = width;
                    _this.obj.data.height = height;
                    $(".modal").removeClass("active");
                } else {
                    alert("Please input number as reuqired!");
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            this.node = this.node.cloneNode(true);
            this.bindClass("selected");
            this.node.addEventListener("dragstart", function (event) {
                console.log("dragstart");
                event.target.className += " dragging";
            }, false);

            var obj = this.obj;

            var offsetWidth = document.querySelector(".side_menu").offsetWidth;
            var offsetHeight = this.node.offsetHeight;

            var _id = this.id;
            this.node.addEventListener("dragend", function (event) {
                console.log("dragend");
                var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
                event.target.className = event.target.className.replace(reg, ' ');

                d3.select(".canvas > svg").append("image").attr("id", _id).classed("drag-ele", true).attr("width", obj.data.width).attr("height", obj.data.height).attr("href", obj.data.logo).attr("transform", function () {
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

    return Images;
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
                        this.components[group][c].resetClass();
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
        id: "object-" + problem[0].names[i],
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

fct.importSelector("#basic_image").setPrototype();
template = fct.newTemplate();
var images = [];
for (var i = 0; i < 9; i++) {
    images.push(new Images({
        name: "image-" + i,
        parentSelector: '.preload',
        modalSelector: '.modal > .modal_panel > .modal_content',
        node: template.cloneNode(true),
        id: "image-" + i,
        data: {}
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
var Animation = function () {

    var colors = ["red", "blue", "purple", "gray", "brown", "green", "skyblue", "black", "silver", "pink", "yellow", "darkgoldenrod"];
    var _settings = {
        "LARGE": 100,
        "MEDIUM": 50,
        "SMALL": 30,
        "RED": 0,
        "BLUE": 1,
        "PURPLE": 2,
        "GRAY": 3,
        "BROWN": 4,
        "GREEN": 5,
        "SKYBLUE": 6,
        "BLACK": 7,
        "SILVER": 8,
        "PINK": 9,
        "YELLOW": 10,
        "DARKGOLDENROD": 11,
        "10COLORSCHEMA": 10,
        "FONT_LARGE": "40px",
        "FONT_MEDIUM": "25px",
        "FONT_SMALL": "15px",
        "PLAY_FAST": 200,
        "PLAY_MEDIUM": 500,
        "PLAY_SLOW": 800
    };

    function _applySettings(options) {
        var sts = {
            width: _settings.MEDIUM,
            height: _settings.MEDIUM,
            fontSize: "15px",
            dx: 0,
            dy: _settings.MEDIUM + 20,
            speed: _settings.PLAY_SLOW
        };
        if (options) {
            sts = Object.assign({}, sts, options);
        }
        return sts;
    }

    function _register(initials, options) {
        if (!(initials.length > 0)) throw "Initial states not correct!";else {
            (function () {
                var sts = _applySettings(options);
                var group = d3.select(".canvas > svg").selectAll("g").data(initials).enter().append("g").attr("class", "group").attr("id", function (d, i) {
                    return d.id;
                }).attr("transform", function (d, i) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
                group.append("image").attr("width", sts.width).attr("height", sts.height).attr("href", function (d, i) {
                    var obj = models[i].obj;
                    return obj.data.logo;
                });
                group.append("text").attr("dx", function (d, i) {
                    return sts.dx;
                }).attr("dy", function (d, i) {
                    return sts.dy;
                }).attr("font-size", sts.fontSize).text(function (d, i) {
                    return "Object-" + d.id;
                });
            })();
        }
        return this;
    }

    function _clear() {
        var canvas = $(".canvas > svg");
        canvas.empty();
    }

    function _play(steps, options) {
        console.log(steps);
        var sts = _applySettings(options);
        for (var s in steps) {
            if (steps[s].length > 0) {
                for (var o in steps[s]) {
                    d3.select("#" + steps[s][o].id).transition().attr("transform", function (d, i) {
                        return "translate(" + steps[s][o].x + "," + steps[s][o].y + ")";
                    }).delay(s * sts.speed);
                }
            } else {
                d3.select("#" + steps[s].id).transition().attr("transform", function (d, i) {
                    return "translate(" + steps[s].x + "," + steps[s].y + ")";
                }).delay(s * sts.speed);
            }
        }
        AxisPlayer.play(sts.speed);
        return this;
    }

    return {
        register: _register,
        play: _play,
        clear: _clear,
        settings: _settings
    };
}();

var animationOptions = {
    width: Animation.settings.MEDIUM,
    height: Animation.settings.MEDIUM,
    fontSize: Animation.settings.FONT_MEDIUM,
    dx: 0,
    dy: Animation.settings.MEDIUM + 20,
    speed: Animation.settings.PLAY_SLOW
};

// todo this if the domain change order of arguments
var ArgsToIndexMapper = function ArgsToIndexMapper(arg) {
    var mapper = { "?x": 0, "?y": 1, "?z": 2 };
    if (mapper[arg] || mapper[arg] == 0) return mapper[arg];
    throw new Error("Argument " + arg + " is not recognizable: Argument order need to be changed if domain is using special order of letters other than alphabet!");
};

/**
 *  transform raw data to animation objects
 *  @getInit()
 *  @initialte()
 *  @transform()
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
     * @actions domain action definitions
     * */
    function _initiate(predicates, init, solutions, actions) {
        _clear();
        if (!init || !solutions || !predicates || !actions) {
            throw "Arguments Not Correct!";
        }
        for (var p in predicates) {
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
            //if (init[i].args.length == 1) {
            if (init[i].args[0]) _initialStates[init[i].args[0]] = {
                id: init[i].args[0],
                x: 500,
                y: 50
            };
            //}
        }

        // derivative cases
        var loopStack = [];
        for (var i in init) {
            if (init[i].args.length > 1) {
                var b = true;
                /** as the input order of arguments are now in dependent order, we don't need a loopStack to handle non-existence dependencies
                 * but would be useful in the future ⤵
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

                    if (init[i].truthiness == "true")
                        // init[i].args[0]: the first argument is always the argument to be operated on
                        _initialStates[init[i].args[0]] = (_predicates$init$i$na = _predicates[init[i].name]).true.apply(_predicates$init$i$na, [init[i].args[0]].concat(_toConsumableArray(init[i].args.map(function (p, index) {
                            return _initialStates[init[i].args[index]];
                        }))));else _initialStates[init[i].args[0]] = (_predicates$init$i$na2 = _predicates[init[i].name]).false.apply(_predicates$init$i$na2, [init[i].args[0]].concat(_toConsumableArray(init[i].args.map(function (p, index) {
                        return _initialStates[init[i].args[index]];
                    }))));
                }
            }
        }
        /** as the input order of arguments are now in dependent order, we don't need a loopStack to handle non-existence dependencies
         * but would be useful in the future ⤵
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

    function _clear() {
        _initialStates = {};
        _predicates = []; // inherently they are functions that map last state to next state
        _actions = {};
        _solutions = []; // store actual solutions objects to represent what is the next pair of coordinates
        _dataArray = [];
    }

    function _transform() {
        // transform...
        for (var s in _solutions) {
            var effs = _actions[_solutions[s].name].effects;
            var stack = [];

            var _loop = function _loop() {
                // specify which parameter should be map to which argument(in index)
                var indices = effs[e].parameters ? effs[e].parameters.map(function (prs) {
                    return ArgsToIndexMapper(prs.name);
                }) : [];

                // 1. map arguments in solution to function in initialStates
                // 2. expand initialStates array as arguments from the 2nd to last at predicate function
                // 3. the first argument of predicate function is object id/name
                if (effs[e].truthiness == "true") {
                    var _predicates$effs$e$na;

                    var arr = _solutions[s].args.map(function (sol, index) {
                        if (indices.length > 0) return _initialStates[_solutions[s].args[indices[index]]];
                        return _initialStates[_solutions[s].args[index]];
                    });
                    var preObj = arr[0];
                    var afterObj = (_predicates$effs$e$na = _predicates[effs[e].name]).true.apply(_predicates$effs$e$na, [arr[0].id].concat(_toConsumableArray(arr)));
                    if (preObj.x != afterObj.x || preObj.y != afterObj.y) stack.push(afterObj);
                } else {
                    var _predicates$effs$e$na2;

                    var _arr = _solutions[s].args.map(function (sol, index) {
                        if (indices.length > 0) return _initialStates[_solutions[s].args[indices[index]]];
                        return _initialStates[_solutions[s].args[index]];
                    });
                    var _preObj = _arr[0];
                    var _afterObj = (_predicates$effs$e$na2 = _predicates[effs[e].name]).false.apply(_predicates$effs$e$na2, [_arr[0].id].concat(_toConsumableArray(_arr)));
                    if (_preObj.x != _afterObj.x || _preObj.y != _afterObj.y) stack.push(_afterObj);
                }
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

/**
 *  Map customize predicate settings to animation config
 * */
var predicateMappings = function predicateMappings(mappings) {
    if (!mappings) {
        return initialMappings;
    }
    var imap = initialMappings;
    for (var _i = 0; _i < imap.length; _i++) {
        for (var j in mappings) {
            if (mappings[j].name == imap[_i].name) {
                imap[_i] = mappings[j];
            }
        }
    }
    return imap;
};

var checkNum = function checkNum(toCheck) {
    return !isNaN(parseFloat(toCheck));
};

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
        var svg = d3.select(".canvas").append("svg").attr("width", "100%").attr("height", "100%");
        document.querySelector(".canvas > svg").addEventListener("drop", function () {
            console.log("drop");
        }, false);
    }

    function _renderButtons() {
        // set each cuz for each tab the buttons are different
        $(".btn.edit").each(function () {
            $(this).click(function () {
                if (document.querySelector(".template.selected")) {
                    $(".modal").addClass("active");
                    document.querySelector(".modal > .modal_panel > .modal_content").innerHTML = "";
                    document.querySelector(".template.selected").component.renderModal();
                } else {
                    alert("Please select a component to view.");
                }
            });
        });
        $(".btn.start").each(function () {
            $(this).click(function () {
                var init = [];
                for (var p in problem[1]) {
                    var o = problem[1][p];
                    init.push({
                        name: o.name,
                        args: o.parameters ? o.parameters.map(function (p) {
                            return p.value;
                        }) : [],
                        truthiness: o.truthiness
                    });
                }
                var trans = Transformer.initiate(predicateMappings(animationFuncs), init, solution, domain[3]);
                // enter initial condition
                var anime = Animation.register(trans.getInit(), animationOptions);
                // play steps
                anime.play(trans.transform(), animationOptions);
            });
        });
        $(".btn.reset").each(function () {
            $(this).click(function () {
                Animation.clear();
                AxisPlayer.clear();
            });
        });
        $(".btn.settings").each(function () {
            $(this).click(function () {
                var str = "<div class='model'>" + "<header><h3 class='modelid'>Settings</h3></header><div class='content'><div class='content-left'>" + "<span><label><i class='fa fa-arrows-h' aria-hidden='true'></i></label><input id='obj-width' type='text' placeholder='Width'></span>" + "<span><label><i class='fa fa-arrows-v' aria-hidden='true'></i></label><input id='obj-height' type='text' placeholder='Height'></span>" + "<div class='radios'><div class='radio'><label for='font-small'><i class='fa fa-font' aria-hidden='true'></i></label><input id='font-small' type='radio' name='font-size' value='12px'></div>" + "<div class='radio'><label for='font-medium'><i class='fa fa-font fa-2x' aria-hidden='true'></i></label><input id='font-medium' type='radio' name='font-size' value='15px'></div>" + "<div class='radio'><label for='font-large'><i class='fa fa-font fa-3x' aria-hidden='true'></i></label><input id='font-large' type='radio' name='font-size' value='20px'></div></div>" + "</div><div class='modal-divider'></div>" + "<div class='content-right'>" + "<span><label><i class='fa fa-indent' aria-hidden='true'></i></label><input id='obj-offsetx' type='text' placeholder='Offset X'></span>" + "<span><label><i class='fa fa-outdent' aria-hidden='true'></i></label><input id='obj-offsety' type='text' placeholder='Offset Y'></span>" + "<div class='radios'><div class='radio'>" + "<input type='radio' name='speed' id='slow' value='800'><label for='slow'>Slow</label></div>" + "<div class='radio'><input type='radio' name='speed' id='medium' value='500'><label for='medium'>Medium</label></div>" + "<div class='radio'><input type='radio' name='speed' id='fast' value='200'><label for='fast'>Fast</label></div></div>" + "</div></div><span class='modal-btns'><button id='modal-settings-confirm'>Confirm</button></span></div>";
                var parser = new DOMParser();
                str = str.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
                var domPrototype = parser.parseFromString(str, "text/html");
                document.querySelector(".modal > .modal_panel > .modal_content").innerHTML = "";
                document.querySelector('.modal > .modal_panel > .modal_content').appendChild(domPrototype.body.childNodes[0]);
                $("#modal-settings-confirm").click(function () {
                    var width = document.getElementById("obj-width").value;
                    var height = document.getElementById("obj-height").value;
                    var offX = document.getElementById("obj-offsetx").value;
                    var offY = document.getElementById("obj-offsety").value;
                    if ((width == "" || checkNum(width)) && (height == "" || checkNum(height)) && (offX == "" || checkNum(offX)) && (offY == "" || checkNum(offY))) {
                        if (height) animationOptions.height = height;
                        if (width) animationOptions.width = width;
                        if (offX) animationOptions.dy = offY;
                        if (offY) animationOptions.dx = offX;
                        var fontSize = document.getElementsByName("font-size");
                        fontSize.forEach(function (f, i) {
                            if (f.checked == true) {
                                animationOptions.fontSize = f.value;
                            }
                        });
                        var animeSpd = document.getElementsByName("speed");
                        animeSpd.forEach(function (spd, i) {
                            if (spd.checked == true) {
                                animationOptions.speed = parseInt(spd.value);
                            }
                        });
                        $(".modal").removeClass("active");
                    } else {
                        alert("Please enter number!");
                    }
                });

                $(".modal").addClass("active");
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
    var timeoutStack = [];
    var _play = function _play() {
        var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

        $(".element").each(function (i, d) {
            var _this = $(this);
            var ts = setTimeout(function () {
                _this.addClass("active");
            }, speed * i);
            var te = setTimeout(function () {
                _this.removeClass("active");
            }, speed * (i + 1));
            timeoutStack.push(ts);
            timeoutStack.push(te);
        });
    };

    var _clear = function _clear() {
        timeoutStack.forEach(function (t) {
            clearTimeout(t);
            $(".element").each(function (i, d) {
                $(this).removeClass("active");
            });
        });
    };

    return {
        play: _play,
        clear: _clear
    };
}();

/**
 * Change image of object
 * @previewImage(imgSelector, file, callback);
 * */
var previewImage = function previewImage(imgSelector, file, callback) {
    if (!imgSelector || !file) throw new Error("No Selector or File Error");

    var preview = null;
    if (typeof imgSelector == "string") preview = document.querySelector(imgSelector);else if ((typeof imgSelector === "undefined" ? "undefined" : _typeof(imgSelector)) == "object") preview = imgSelector;else throw new Error("Selector Type not Recognizable Error");
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result;
        if (callback) callback(reader.result);
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    }
};

renderInfrastructure.renderAll();

// modules loading
var maps = { "models": models, "actions": actions, "predicates": predicates, "images": images };
var renderer = Renderer.getInstance(maps);
renderer.init();

//# sourceMappingURL=render_canvas-compiled.js.map