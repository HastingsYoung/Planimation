let array = localStorage.getItem('file_container');
if (!array || array.length < 3) {
    alert("Please Load Requisite Files Before Entering This Page!");
    window.location.href = "../index";
}
array = JSON.parse(array);

let parseSettings = (str) => {
    let ds = JSON.parse(str);
    if (ds.animationOptions && ds.animationOptions.transition) {
        ds.animationOptions.transition = eval("(" + ds.animationOptions.transition.trim() + ")");
    }
    ;
    if (ds.domains && ds.domains.BLOCKSWORLD) {
        ds.domains.BLOCKSWORLD.forEach((pre, i)=> {
            if (pre.true_func) {
                pre.true_func = eval("(" + pre.true_func + ")");
            }
            if (pre.false_func) {
                pre.false_func = eval("(" + pre.false_func + ")");
            }
        });
    }
    if (ds.domains && ds.domains.GRIPPER) {
        ds.domains.GRIPPER.forEach((pre, i)=> {
            if (pre.true_func) {
                pre.true_func = eval("(" + pre.true_func + ")");
            }
            if (pre.false_func) {
                pre.false_func = eval("(" + pre.false_func + ")");
            }
        });
    }
    return ds;
};

let domain = PDDL_Parser.parse(array[0]);
console.log(domain);
let problem = PDDL_Parser.parse(array[1]);
console.log(problem);
let solution = Plan_Parser.parse(array[2]);
console.log(solution);
let defaultSettings = array[3] ? parseSettings(array[3]) : {};
console.log(defaultSettings);

const templatesMapping = defaultSettings.templatesMapping ? defaultSettings.templatesMapping : {
    "model": "http://localhost:4000/templates/models/Block.html",
    "action": "http://localhost:4000/templates/actions/BasicAction.html",
    "predicate": "http://localhost:4000/templates/predicates/BasicPredicate.html",
    "image": "http://localhost:4000/templates/images/BasicImage.html"
}

const argsToPriorityMapping = defaultSettings.argsToPriorityMapping ? defaultSettings.argsToPriorityMapping : {
    "?x": 0,
    "?y": 1,
    "?z": 2,
    "?from": 0,
    "?to": 1,
    "?obj": 0,
    "?room": 1,
    "?gripper": 2
};


/**
 * @constructor constructor of Rule, e.g. let rule = new Rule({func:function(a,b,c){},name:"rule1"});
 * */
class Rule {
    constructor(props) {
        if (!props || !props.func || !props.name)
            throw new Error("No arguments or unrecognized argument input in class Rule");
        this.rule = props;
    }

    apply(...args) {
        let result = this.rule.func(...args);
        return result;
    }
}

let animationFuncs = [];
/**
 * Blocks World
 **/
const blocksWorldMappings = defaultSettings.domains && defaultSettings.domains.BLOCKSWORLD ? defaultSettings.domains.BLOCKSWORLD : [{
    name: "on",
    true_func: function (id, o1, o2) {
        return {
            id: id,
            x: o2.x,
            y: o2.y - 40
        }
    },
    false_func: function (id, o1, o2) {
        return {
            id: id,
        }
    }
}, {
    name: "ontable",
    true_func: function (id, o1) {
        return {
            id: id,
            x: 50 + Math.floor(Math.random() * 8) * 50,
            y: 400
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
        }
    }
}, {
    name: "clear",
    true_func: function (id, o1) {
        return {
            id: id,
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
        }
    }
}, {
    name: "handempty",
    true_func: function (id, o1) {
        return {
            id: id,
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
        }
    }
}, {
    name: "holding",
    true_func: function (id, o1) {
        return {
            id: id,
            x: 400,
            y: 100
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
            //x: o1.x,
            //y: o1.y
        }
    }
}];

/**
 * Gripper
 **/
const gripperMappings = defaultSettings.domains && defaultSettings.domains.GRIPPER ? defaultSettings.domains.GRIPPER : [{
    name: "room",
    true_func: function (id, o1) {
        return {
            id: id,
            x: 100,
            y: 50 + Math.random() * 400
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "ball",
    true_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    },
    false_func: function (id, o1, o2) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "at",
    true_func: function (id, o1, o2) {
        return {
            id: id,
            x: o2.x,
            y: o2.y
        }
    },
    false_func: function (id, o1, o2) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "gripper",
    true_func: function (id, o1) {
        return {
            id: id,
            x: 400 + (Math.random() * 300),
            y: 100
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "free",
    true_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "at-robby",
    true_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    },
    false_func: function (id, o1) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}, {
    name: "carry",
    true_func: function (id, o1, o2) {
        return {
            id: id,
            x: o2.x - 20,
            y: o2.y + 100
        }
    },
    false_func: function (id, o1, o2) {
        return {
            id: id,
            x: o1.x,
            y: o1.y
        }
    }
}];

const blocksWorldRules = {
    initRule: new Rule({
        name: "CHECK_ONTABLE",
        func: function (_initialStates, init, _predicates) {
            for (var i in init) {
                if (init[i].args.length >= 1) {
                    if (init[i].name == "ontable")
                        if (init[i].truthiness == "true") {
                            let temp = _predicates[init[i].name].true(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        } else {
                            let temp = _predicates[init[i].name].false(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        }
                }
            }
            for (var i in init) {
                if (init[i].args.length >= 1) {
                    if (init[i].name != "ontable")
                        if (init[i].truthiness == "true") {
                            let temp = _predicates[init[i].name].true(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        } else {
                            let temp = _predicates[init[i].name].false(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        }
                }
            }
            return _initialStates;
        }
    })
};

/**
 * Map Domain to Default Settings
 * */
const domainMappings = {
    "BLOCKSWORLD": {
        mappings: blocksWorldMappings,
        rules: blocksWorldRules
    },
    "GRIPPER": {
        mappings: gripperMappings
    }
}

const selectMapping = (domain)=> {
    if (domainMappings[domain.toUpperCase()])
        return domainMappings[domain.toUpperCase()]
    alert("The domain is currently not supported, please contact author to continue!");
    window.location.href = "../index";
}

let initialMappings = [];
initialMappings = selectMapping(defaultSettings.currentDomain ? defaultSettings.currentDomain : "BLOCKSWORLD").mappings;

/**
 * A simple schema for data validation.
 *
 * Usage: let ds = new DataSchema({
 *      key1:{
 *          type: "String"
 *      },
 *      key2:{
 *          type: "String",
 *          regex: /abc/gi
 *      },
 *      key3:{
 *          type: "Number"
 *      },
 *      key4:{
 *          type: "Array"
 *      }
 * });
 *
 *      ds.validate(data);
 * */
class DataSchema {
    constructor(props) {
        if (!props || Object.keys(props).length <= 0) {
            throw new Error("No Data Input Error, Please Add Properties to Schema!")
        }
        const DATATYPES = {
            "string": "String",
            "object": "Object",
            "number": "Number",
            "array": "Array",
            "boolean": "Boolean",
            "function": "Function"
        };
        this.keys = Object.keys(props);
        let schema = {};
        this.keys.forEach((k, i)=> {
            if (typeof props[k] != "object" || !props[k].type || !DATATYPES[props[k].type.toLowerCase()]) {
                throw new Error("Unrecognizable Props Input: The argument " + k + " does not conform to schema rules. Please check the input.");
            }
        });
        this.schema = props;
    }

    validate(data) {
        const dataKeys = Object.keys(data);
        if (dataKeys.length != this.keys.length)
            return false;
        for (let i = 0; i < dataKeys.length; i++) {
            let dks = dataKeys[i];
            if (!this.schema[dks]) {
                return false;
            } else {
                if (typeof data[dks] != this.schema[dks].type.toLowerCase()) {
                    let type = this.schema[dks].type.toLowerCase();
                    if (type != "number" && type != "array")
                        return false;
                    else {
                        if (type == "number" && !DataSchema.isNumber(data[dks]))
                            return false;
                        else if (type == "array" && data[dks].length < 0)
                            return false;
                    }
                }
            }
            if (this.schema[dks].regex) {
                if (typeof this.schema[dks].regex == 'object') {
                    if (!this.schema[dks].regex.test(data[dks])) {
                        return false;
                    }
                } else {
                    let re = new RegExp(this.schema[dks].regex);
                    if (!re.test(data[dks])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    static validateJSON(json) {
        if (typeof json == "string") {
            this.json = JSON.parse(json);
        } else if (typeof json == 'object') {
            this.json = json;
        } else {
            throw new Error("Unknown JSON Type Error!");
        }
        if (this.json.type && this.json.data) {
            return true;
        }
        return false;
    }

    static validateUrl(url) {
        let regex = /[-a-zA-Z0-9@:%+.~#?&//=]{2,256}.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%+.~#?&//=]*)?/gi;
        return regex.test(url);
    }

    static isObject(obj) {
        return typeof obj == "object";
    }

    static isFunction(func) {
        return typeof func == "function";
    }

    static isString(str) {
        return typeof str == "string";
    }

    static isFunction(func) {
        return typeof func == "function";
    }

    static isNumber(num) {
        return !isNaN(parseFloat(num));
    }

    static isArray(arr) {
        return typeof arr == "object" && arr.length >= 0;
    }
}


/**
 * let priorQueue = new PriorityQueue([3,2,1,4,5]);
 * let priorQueue = new PriorityQueue([[1,2],[3,1],[2,5]]);
 * @init [[priority, value],[priority, value]] or [priority,priority,priority]
 * */
class PriorityQueue {
    constructor(init) {
        this.arr = [];
        if (init && init.length >= 0) {
            let self = this;
            init.forEach((ini, i)=> {
                if (!isNaN(parseFloat(ini)))
                    self.insert(ini, i);
                else if (ini.length >= 0) {
                    self.insert(ini[0], ini[1]);
                } else
                    throw new Error("Unrecognized argument type in PriorityQueue!");
            });
        }
    }

    insert(priority, value) {
        this.arr.push({
            prior: priority,
            value: value,
            index: this.arr.length
        });
        this.sort();
    }

    sort() {
        this.arr.sort(function (a, b) {
            if (a.prior < b.prior) {
                return -1;
            } else if (a.prior == b.prior) {
                return 0;
            } else {
                return 1;
            }
        });
    }

    max() {
        let max = {};
        this.arr.forEach((a, i)=> {
            if (!max.prior)
                max = a;
            if (max.prior < a.prior) {
                max = a;
            }
        });
        return max;
    }

    eject() {
        return this.arr.pop().value;
    }

    ejectPrior() {
        return this.arr.pop().prior;
    }

    get indices() {
        let resultArr = [];
        this.arr.forEach((a, i)=> {
            resultArr[a.index] = i;
        });
        return resultArr;
    }

    get values() {
        let resultArr = [];
        this.arr.forEach((a, i)=> {
            resultArr[a.index] = a.value;
        });
        return resultArr;
    }

    get sortedValues() {
        let resultArr = [];
        this.arr.forEach((a, i)=> {
            resultArr.push(a.value);
        });
        return resultArr;
    }

    get sortedValuesDesc() {
        let resultArr = [];
        this.arr.forEach((a, i)=> {
            resultArr.unshift(a.value);
        });
        return resultArr;
    }

    static ArgsToPriorityMapper(arg) {
        const mapper = argsToPriorityMapping ? argsToPriorityMapping : {
            "?x": 0,
            "?y": 1,
            "?z": 2,
            "?from": 0,
            "?to": 1,
            "?obj": 0,
            "?room": 1,
            "?gripper": 2
        };
        if (mapper[arg] || mapper[arg] == 0)
            return mapper[arg];
        throw new Error("Argument " + arg + " is not recognizable: Argument order need to be changed if domain is using special order of letters other than alphabet!");
    }
}

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

        importSelector(pattern, callback) {
            if (!DataSchema.validateUrl(pattern)) {
                this._link = document.querySelector(pattern);
                this._content = this._link.import;
            } else {
                let _this = this;
                let pms = new Promise(function (resolve, reject) {
                    $.ajax({url: pattern}).done(function (data) {
                        resolve(data);
                    }).fail(function (err) {
                        if (err)
                            alert(err);
                        reject();
                    });
                });
                pms.then(function (data) {
                    _this._content = data;
                    callback(_this);
                });
            }
        }

        /**
         * url template currently not supported
         * */
        // todo add url pattern to array input
        importSelectorAll(patterns) {
            this._link = document.querySelectorAll(patterns);
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

/**
 *  Components to be shown and operated on.
 *  @render() render component to tabs
 *  @resetClass() reset class name bound to component
 *  @parseDom() parse string as DOM element
 * */
class Component {
    constructor(props) {
        if (!props)
            throw new Error("Unrecognized argument input.");
        var keys = Object.keys(props);
        for (var k in keys) {
            this[keys[k]] = props[keys[k]];
        }
    }

    render() {
        this.bindClass("selected");
    }

    resetClass(className) {
        if (className) {
            $(this.node).removeClass(className);
            $(this.node).off("click");
            return;
        }
        $(this.node).removeClass("selected");
        $(this.node).off("click");
    }

    bindClass(className) {
        if (!className)
            throw new Error("No Class Name Entered Exception At 'bindClass' Method of Component class!");
        let node = this.node;
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

    parseDom(str) {
        let parser = new DOMParser();
        str = str.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
        let domPrototype = parser.parseFromString(str, "text/html");
        return domPrototype.body.childNodes[0];
    }

    customizeContent(node, titl, cont) {
        let title = node.querySelector("p.template-title");
        let content = node.querySelector("p.template-desc");
        if (titl) {
            title.innerHTML = titl;
        } else {
            if (title)
                title.parentNode.removeChild(title);
        }
        if (cont) {
            content.innerHTML = cont;
        } else {
            if (content)
                content.parentNode.removeChild(content);
        }
    }

    getLogoLink() {
        let obj = JSON.parse(this.node.querySelector("input").value);
        return obj.data.logo;
    }
}

class Model extends Component {

    constructor(props) {
        super(props);
        let json = this.node.querySelector("input").value;
        if (DataSchema.validateJSON(json))
            this.obj = JSON.parse(json);
    }

    renderModal(parentNode) {

        var obj = this.obj;
        var tags = "";
        for (var t in obj.data.domaintags) {
            tags += "<span>" + obj.data.domaintags[t] + "</span>";
        }
        var nodeContent = "<div class='model'>" +
            "<header><h3 class='modelid'>Model Id: " + this.id +
            "</h3></header><div class='content'><div class='tags'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" +
            "<div class='sub_header'><h5>Domain Type: </h5>" + "<span>" + obj.data.domaintype + "</span>" +
            "</div><div class='sub_header'><h5>Domain Tags: </h5>" + tags + "</div>" +
            "</div><div class='description'><h5>Description: </h5><p>" + obj.data.domaindescription + "</p></div></div>" +
            "<span class='modal-btns'><div class='file-upload-btn'><input type='file'/><span><i class='fa fa-cloud-upload'></i>Upload</span></div></span></div>";
        let _this = this;
        if (parentNode) {
            parentNode.appendChild(nodeContent);
            parentNode.querySelector("input").addEventListener("change", function (evt) {
                previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                    _this.obj.data.logo = imgLink;
                });
                previewImage(parentNode.querySelector("img"), evt.target.files[0]);
            });
        }
        else if (this.modalSelector) {
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
            document.querySelector(this.modalSelector).querySelector("input").addEventListener("change", function (evt) {
                previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                    _this.obj.data.logo = imgLink;
                });
                previewImage(document.querySelector(_this.modalSelector).querySelector("img"), evt.target.files[0]);
            });
        }

    }

    render() {
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
}

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
            "</div><div class='description'><h5>Description: </h5><p>Action description...</p></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
    }
}

class Predicate extends Component {
    renderModal(parentNode) {
        var args = []
        let _this = this;
        for (var t in this.data.parameters) {
            args.push(this.data.parameters[t].name);
        }

        var predicates = "(" + args.join(",") + ")";
        let predicateFuncs = initialMappings.filter((init, i)=> {
            return init.name == _this.data.name
        });
        console.log(predicateFuncs);
        var nodeContent = "<div class='predicate'>" + "<header><h3 class='name'>Predicate Name: " + this.data.name +
            "</h3></header>" + "<div class='content'><div class='tags'>" +
            "<div class='sub_header'><h5>Predicates: </h5>" + predicates + "</div>" + "<span><label><i class='fa fa-plus-square fa-2x' aria-hidden='true'></i></label><input class='predicate-true' placeholder='True Condition'/></span>"
            + "<span><label><i class='fa fa-minus-square fa-2x' aria-hidden='true'></i></label><input class='predicate-false' placeholder='False Condition' /></span>" +
            "<span class='modal-btns'>" +
            "<button id='modal-predicate-confirm' class='btn-confirm'>Confirm</button><button class='btn-cancel'>Cancel</button></span>" + "</div><div class='modal-divider'></div><div class='description'><h4>Example</h4>" +
            "<p>If we've got variable (?a,?b) then the input should be x:a.x+b.x+10;y:a.y*10-b.y</p>" +
            "<h4>Initial Formula</h4><p><b>True</b>:" + predicateFuncs[0].true_func.toString() + "</p><p><b>False</b>:" + predicateFuncs[0].false_func.toString() + "</p></div></div></div>";
        if (parentNode)
            parentNode.appendChild(nodeContent);
        else if (this.modalSelector)
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
        $("#modal-predicate-confirm").click(function () {
            let tValue = $(".predicate-true").val();
            let fValue = $(".predicate-false").val();
            var arrT = tValue.trim().split(";");
            var arrF = fValue.trim().split(";");
            var arrXT = arrT[0].split(":");
            var arrYT = arrT[1].split(":");
            var arrXF = arrF[0].split(":");
            var arrYF = arrF[1].split(":");
            const funcBodyT = "(function(id," + args.join(",").replace(/\?/g, "") + "){return {id:id,'x':" + arrXT[1] + ",'y':" + arrYT[1] + "}})";
            const funcBodyF = "(function(id," + args.join(",").replace(/\?/g, "") + "){return {id:id,'x':" + arrXF[1] + ",'y':" + arrYF[1] + "}})";
            animationFuncs.push({
                name: _this.data.name,
                true_func: eval(funcBodyT),
                false_func: eval(funcBodyF)
            });
            $(".modal").removeClass("active");
        });
    }
}

class Image extends Component {

    constructor(props) {
        super(props);
        let json = this.node.querySelector("input").value;
        if (DataSchema.validateJSON(json))
            this.obj = JSON.parse(json);
    }

    renderModal(parentNode) {

        var obj = this.obj;
        var nodeContent = "<div class='model'>" +
            "<header><h3 class='modelid'>Image Id: " + this.id +
            "</h3></header><div class='content'><div class='content-left'>" + "<img src='" + obj.data.logo + "' alt='No Image Available'>" +
            "<span class='modal-btns'>" +
            "<div class='file-upload-btn modal-btn'><input type='file'/><span>Upload</span></div></span></div><div class='modal-divider'></div>" +
            "<div class='content-right'>" +
            "<span><label><i class='fa fa-arrows-h' aria-hidden='true'></i></label><input id='image-width' type='text' placeholder='Image Width'></span>" +
            "<span><label><i class='fa fa-arrows-v' aria-hidden='true'></i></label><input id='image-height' type='text' placeholder='Image Height'></span>" +
            "<span class='modal-btns'><button id='modal-image-confirm'>Confirm</button></span></div></div></div>";
        let _this = this;
        if (parentNode) {
            parentNode.appendChild(nodeContent);
            parentNode.querySelector("input").addEventListener("change", function (evt) {
                previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                    _this.obj.data.logo = imgLink;
                });
                previewImage(parentNode.querySelector("img"), evt.target.files[0]);
            });
        }
        else if (this.modalSelector) {
            document.querySelector(this.modalSelector).appendChild(this.parseDom(nodeContent));
            document.querySelector(this.modalSelector).querySelector("input").addEventListener("change", function (evt) {
                previewImage(_this.node.querySelector("img"), evt.target.files[0], function (imgLink) {
                    _this.obj.data.logo = imgLink;
                });
                previewImage(document.querySelector(_this.modalSelector).querySelector("img"), evt.target.files[0]);
            });
        }
        $("#modal-image-confirm").click(function () {
            let width = $("#image-width").val();
            let height = $("#image-height").val();
            if (DataSchema.isNumber(width) && DataSchema.isNumber(height)) {
                _this.obj.data.width = width;
                _this.obj.data.height = height;
                $(".modal").removeClass("active");
            } else {
                alert("Please input number as reuqired!");
            }
        });
    }

    render() {
        this.node = this.node.cloneNode(true);
        const _id = this.id;
        this.bindClass("selected");
        this.node.addEventListener("dragstart", function (event) {
            console.log("dragstart");
            if (document.querySelector("#" + _id)) {
                alert("Each image should only point to one canvas instance! Please choose another image!");
                event.preventDefault();
                return;
            }
            event.target.className += " dragging";
        }, false);

        var obj = this.obj;

        const offsetWidth = document.querySelector(".side_menu").offsetWidth;
        const offsetHeight = this.node.offsetHeight;

        this.node.addEventListener("dragend", function (event) {
            console.log("dragend");
            var reg = new RegExp('(\\s|^)' + "dragging" + '(\\s|$)');
            event.target.className = event.target.className.replace(reg, ' ');

            d3.select(".canvas > svg").append("image").attr("id", _id).classed("drag-ele", true).attr("width", obj.data.width).attr("height", obj.data.height).attr("href", obj.data.logo).attr("transform", function () {
                return "translate(" + (event.x - offsetWidth) + "," + (event.y - obj.data.height * 1.5) + ")";
            }).attr("fill", "#eee");
            d3.select("#" + _id).data([{
                x: event.x - offsetWidth,
                y: event.y - offsetHeight
            }]).call(drag);
            event.stopPropagation();
        }, false);

        this.node.addEventListener("dragover", function (event) {
            console.log("dragover");
        }, false);
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
        constructor(props) {
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
                    this.components[group][c].resetClass();
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

let models = [];
let actions = [];
let predicates = [];
let images = [];

/**
 * Load templates, this is done in promise style in order to address asynchronous issues
 * */
var fct = TemplateFactory.getInstance().importSelector(templatesMapping["model"], function (fct) {
    fct.setPrototype();
    var template = fct.newTemplate();
    for (var i = 0; i < problem[0].names.length; i++) {
        models.push(new Model({
            name: problem[0].names[i],
            parentSelector: '.preload',
            modalSelector: '.modal > .modal_panel > .modal_content',
            id: "object-" + problem[0].names[i],
            node: template.cloneNode(true)
        }));
    }

    fct.importSelector(templatesMapping["action"], function (fct) {
        fct.setPrototype();
        template = fct.newTemplate();
        for (var i in domain[3]) {
            actions.push(new Action({
                name: domain[3][i].name,
                parentSelector: '.preload',
                modalSelector: '.modal > .modal_panel > .modal_content',
                node: template.cloneNode(true),
                data: domain[3][i]
            }));
        }

        fct.importSelector(templatesMapping["predicate"], function (fct) {
            fct.setPrototype();
            template = fct.newTemplate();
            for (var i in domain[2]) {
                predicates.push(new Predicate({
                    name: domain[2][i].name,
                    parentSelector: '.preload',
                    modalSelector: '.modal > .modal_panel > .modal_content',
                    node: template.cloneNode(true),
                    data: domain[2][i]
                }));
            }
            fct.importSelector(templatesMapping["image"], function (fct) {
                fct.setPrototype();
                template = fct.newTemplate();
                for (var i = 0; i < 15; i++) {
                    images.push(new Image({
                        name: "image-" + i,
                        parentSelector: '.preload',
                        modalSelector: '.modal > .modal_panel > .modal_content',
                        node: template.cloneNode(true),
                        id: "image-" + i,
                        data: {}
                    }));
                }
                // modules loading
                let maps = {"models": models, "actions": actions, "predicates": predicates, "images": images};
                renderer = Renderer.getInstance(maps);
                Infrastructure.renderAll();
                renderer.init();
            });
        });
    });
});

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

    let colors = ["red", "blue", "purple", "gray", "brown", "green", "skyblue", "black", "silver", "pink", "yellow", "darkgoldenrod"]
    let _settings = {
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
        "PLAY_SLOW": 2000,
        "TRANSITION_EASE_LINEAR": d3.easeLinear,
        "TRANSITION_EASE_CUBIC": d3.easeCubic,
        "TRANSITION_EASE_POLYOUT": d3.easePolyOut,
        "TRANSITION_EASE_POLYIN": d3.easePolyIn,
        "TRANSITION_EASE_BOUNCE": d3.easeBounce,
        "TRANSITION_EASE_ELASTIC_IN": d3.easeElasticIn,
        "TRANSITION_EASE_ELASTIC_OUT": d3.easeElasticOut,
        "TRANSITION_EASE_ELASTIC_IN_OUT": d3.easeElasticInOut,
        "TRANSITION_EASE_BACK_IN": d3.easeBackIn,
        "TRANSITION_EASE_BACK_OUT": d3.easeBackOut,
        "TRANSITION_EASE_BACK_IN_OUT": d3.easeBackInOut
    };

    function _applySettings(options) {
        let sts = {
            width: _settings.MEDIUM,
            height: _settings.MEDIUM,
            fontSize: "15px",
            dx: 0,
            dy: _settings.MEDIUM + 20,
            speed: _settings.PLAY_SLOW,
            transition: _settings.TRANSITION_EASE_CUBIC,
        }
        let stsSchema1 = new DataSchema({
            "width": {
                type: "Number"
            },
            "height": {
                type: "Number"
            },
            "fontSize": {
                type: "String",
                regex: /\d+(px)$/gi
            },
            "dx": {
                type: "Number"
            },
            "dy": {
                type: "Number"
            },
            "speed": {
                type: "Number"
            },
            "transition": {
                type: "String"
            },
            "basePosition": {
                type: "Object"
            }
        });
        let stsSchema2 = new DataSchema({
            "width": {
                type: "Number"
            },
            "height": {
                type: "Number"
            },
            "fontSize": {
                type: "String",
                regex: /\d+(px)$/gi
            },
            "dx": {
                type: "Number"
            },
            "dy": {
                type: "Number"
            },
            "speed": {
                type: "Number"
            },
            "transition": {
                type: "Function"
            },
            "basePosition": {
                type: "Object"
            }
        });
        if (options) {
            if (stsSchema1.validate(options) || stsSchema2.validate(options)) {
                sts = Object.assign({}, sts, options);
                if (options.transition) {
                    sts.transition = _settings[options.transition];
                }
                if (!sts.transition)
                    sts.transition = _settings.TRANSITION_EASE_CUBIC;
            } else {
                alert("Settings Input not in Correct Format!");
            }
        }
        return sts;
    }

    function _register(initials, options) {
        console.log(initials);
        if (!(initials.length > 0))
            throw "Initial states not correct!";
        else {
            let sts = _applySettings(options);
            let group = d3.select(".canvas > svg").selectAll("g").data(initials).enter().append("g").attr("class", "group").attr("id", function (d, i) {
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
        }
        return this;
    }

    function _clear() {
        let canvas = $(".canvas > svg");
        canvas.empty();
        return this;
    }

    function _play(steps, options) {
        console.log(steps);
        let sts = _applySettings(options);
        for (var s in steps) {
            if (steps[s].length > 0) {
                for (var o in steps[s]) {
                    if (o)
                        d3.select("#" + steps[s][o].id).transition().attr("transform", function (d, i) {
                            return "translate(" + steps[s][o].x + "," + steps[s][o].y + ")";
                        }).delay(s * sts.speed)
                            .ease(sts.transition);
                }
            } else {
                //d3.select("#" + steps[s].id).transition().attr("transform", function (d, i) {
                //    return "translate(" + steps[s].x + "," + steps[s].y + ")";
                //}).delay(s * sts.speed)
                //    .ease(sts.transition);
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
    }
}());


let animationOptions = defaultSettings.animationOptions ? defaultSettings.animationOptions : {
    width: Animation.settings.MEDIUM,
    height: Animation.settings.MEDIUM,
    fontSize: Animation.settings.FONT_SMALL,
    dx: 0,
    dy: Animation.settings.MEDIUM + 20,
    speed: Animation.settings.PLAY_MEDIUM,
    basePosition: {
        x: -400,
        y: 500,
        marginX: 50,
        marginY: 0
    },
    transition: Animation.settings.TRANSITION_EASE_CUBIC
}

/**
 *  transform raw data to animation objects
 *  @getInit()
 *  @initiate()
 *  @transform()
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
     * @actions domain action definitions
     * */
    function _initiate(predicates, init, solutions, actions, rules) {
        _clear();
        if (!init || !solutions || !predicates || !actions) {
            throw "Arguments Not Correct!"
        }
        for (var p in predicates) {
            if (typeof predicates[p].true_func == "function" && typeof predicates[p].false_func == "function")
                _predicates[predicates[p].name] = {
                    "true": predicates[p].true_func,
                    "false": predicates[p].false_func
                };
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
            if (init[i].args[0])
                _initialStates[init[i].args[0]] = {
                    id: init[i].args[0],
                    x: animationOptions.basePosition.x + animationOptions.basePosition.marginX * i,
                    y: animationOptions.basePosition.y + animationOptions.basePosition.marginY * i
                };
        }

        // derivative cases
        var loopStack = [];
        if (rules && rules.initRule && rules.initRule instanceof Rule)
            _initialStates = rules.initRule.apply(_initialStates, init, _predicates);
        else
            for (var i in init) {
                if (init[i].args.length >= 1) {
                    var b = true;
                    /** as the input order of arguments are now in dependent order, we don't need a loopStack to handle non-existence dependencies
                     * but would be useful in the future ⤵
                     */
                    //for (var arg = 1; arg < init[i].args.length; arg++) {
                    //    // if any dependent argument does not exist(the first one is variable to be calculated)
                    //    if (!_initialStates[init[i].args[arg]]) {
                    //        loopStack.push({
                    //            args: init[i].args,
                    //            name: init[i].name
                    //        });
                    //        b = false;
                    //        break;
                    //    }
                    //}
                    // if every dependencies is able to be found, set a mapping between first argument and its dependencies
                    if (b) {
                        if (init[i].truthiness == "true") {
                            // init[i].args[0]: the first argument is always the argument to be operated on
                            let temp = _predicates[init[i].name].true(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        } else {
                            let temp = _predicates[init[i].name].false(init[i].args[0], ...(init[i].args.map((p, index)=> {
                                return _initialStates[p];
                            })));
                            _initialStates[init[i].args[0]] = temp.x && temp.y ? temp : _initialStates[init[i].args[0]];
                        }

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
                args: solutions[s].parameters.map((pr)=> {
                    return pr.value;
                })
            });
        }
        return this;
    }

    function _clear() {
        _initialStates = {};
        _predicates = [];    // inherently they are functions that map last state to next state
        _actions = {};
        _solutions = [];   // store actual solutions objects to represent what is the next pair of coordinates
        _dataArray = [];
        return this;
    }

    function _transform() {
        // transform...
        for (var s in _solutions) {
            var effs = _actions[_solutions[s].name].effects;
            var stack = [];
            for (var e in effs) {
                // specify which parameter should be map to which argument(in index)
                let priorities = effs[e].parameters ? effs[e].parameters.map((prs)=>(PriorityQueue.ArgsToPriorityMapper(prs.name))) : [];
                let indices = new PriorityQueue(priorities).indices;
                // 1. map arguments in solution to functions in initialStates
                // 2. expand initialStates array as arguments from the 2nd to last at predicate function
                // 3. the first argument of predicate function is object id/name
                if (effs[e].truthiness == "true") {
                    let arr = (_solutions[s].args.map((sol, index)=> {
                        if (indices.length > 0)
                            return _initialStates[_solutions[s].args[indices[index]]];
                        return _initialStates[_solutions[s].args[index]];
                    }));
                    let preObj = arr[0];
                    let afterObj = _predicates[effs[e].name].true(arr[0].id, ...arr);
                    if (afterObj.x && afterObj.y && (preObj.x != afterObj.x || preObj.y != afterObj.y)) {
                        _initialStates[afterObj.id] = afterObj;
                        stack.push(afterObj);
                    }
                }
                else {
                    let arr = (_solutions[s].args.map((sol, index)=> {
                        if (indices.length > 0)
                            return _initialStates[_solutions[s].args[indices[index]]];
                        return _initialStates[_solutions[s].args[index]];
                    }));
                    let preObj = arr[0];
                    let afterObj = _predicates[effs[e].name].false(arr[0].id, ...arr);
                    if (afterObj.x && afterObj.y && (preObj.x != afterObj.x || preObj.y != afterObj.y)) {
                        _initialStates[afterObj.id] = afterObj;
                        stack.push(afterObj);
                    }
                }
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
    }
}());

/**
 *  Map customize predicate settings to animation config
 * */
const predicateMappings = (mappings)=> {
    if (!mappings) {
        return initialMappings;
    }
    let imap = initialMappings;
    for (let i = 0; i < imap.length; i++) {
        for (var j in mappings) {
            if (mappings[j].name == imap[i].name) {
                imap[i] = mappings[j];
            }
        }
    }
    return imap;
}

/**
 *  Render Infrastructure
 * */
var Infrastructure = (function () {
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
                }
                else {
                    alert("Please select a component to view.");
                }
            });
        });
        $(".btn.start").each(function () {
            $(this).click(function () {
                let init = [];
                for (let p in problem[1]) {
                    let o = problem[1][p];
                    init.push({
                        name: o.name,
                        args: o.parameters ? o.parameters.map((p)=> {
                            return p.value;
                        }) : [],
                        truthiness: o.truthiness
                    });
                }
                let trans = Transformer.initiate(predicateMappings(animationFuncs), init, solution, domain[3], selectMapping(defaultSettings.currentDomain ? defaultSettings.currentDomain : "BLOCKSWORLD").rules);
                // enter initial condition
                let anime = Animation.register(trans.getInit(), animationOptions);
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
                let str = "<div class='model'>" +
                    "<header><h3 class='modelid'>Settings</h3></header><div class='content'><div class='content-left'>" +
                    "<span><label><i class='fa fa-arrows-h' aria-hidden='true'></i></label><input id='obj-width' type='text' placeholder='Width'></span>" +
                    "<span><label><i class='fa fa-arrows-v' aria-hidden='true'></i></label><input id='obj-height' type='text' placeholder='Height'></span>" +
                    "<div class='radios'><div class='radio'><label for='font-small'><i class='fa fa-font' aria-hidden='true'></i></label><input id='font-small' type='radio' name='font-size' value='12px'></div>" +
                    "<div class='radio'><label for='font-medium'><i class='fa fa-font fa-2x' aria-hidden='true'></i></label><input id='font-medium' type='radio' name='font-size' value='15px'></div>" +
                    "<div class='radio'><label for='font-large'><i class='fa fa-font fa-3x' aria-hidden='true'></i></label><input id='font-large' type='radio' name='font-size' value='20px'></div></div>" +
                    "<div class='select'><select name='animation-type' id='animation-type' placeholder='EASING'>" +
                    "<option value='TRANSITION_EASE_CUBIC'>EASE CUBIC</option>" +
                    "<option value='TRANSITION_EASE_LINEAR'>EASE LINEAR</option>" +
                    "<option value='TRANSITION_EASE_POLYOUT'>EASE POLYOUT</option>" +
                    "<option value='TRANSITION_EASE_BOUNCE'>EASE BOUNCE</option>" +
                    "<option value='TRANSITION_EASE_ELASTIC_IN'>EASE EALISTIC-IN</option>" +
                    "<option value='TRANSITION_EASE_ELASTIC_OUT'>EASE EALISTIC-OUT</option>" +
                    "<option value='TRANSITION_EASE_ELASTIC_IN_OUT'>EASE EALISTIC-IN-OUT</option>" +
                    "<option value='TRANSITION_EASE_BACK_IN'>EASE BACK-IN</option>" +
                    "<option value='TRANSITION_EASE_BACK_OUT'>EASE BACK-OUT</option>" +
                    "<option value='TRANSITION_EASE_BACK_IN_OUT'>EASE BACK-IN-OUT</option>" +
                    "</select><label class='select_arrow'><i class='fa fa-arrow-circle-o-down fa-2x' aria-hidden='true'></i></label></div>" +
                    "</div><div class='modal-divider'></div>" +
                    "<div class='content-right'>" +
                    "<span><label><i class='fa fa-indent' aria-hidden='true'></i></label><input id='obj-offsetx' type='text' placeholder='Offset X'></span>" +
                    "<span><label><i class='fa fa-outdent' aria-hidden='true'></i></label><input id='obj-offsety' type='text' placeholder='Offset Y'></span>" + "<div class='radios'><div class='radio'>" +
                    "<input type='radio' name='speed' id='slow' value='800'><label for='slow'>Slow</label></div>" +
                    "<div class='radio'><input type='radio' name='speed' id='medium' value='500'><label for='medium'>Medium</label></div>" +
                    "<div class='radio'><input type='radio' name='speed' id='fast' value='200'><label for='fast'>Fast</label></div></div>" +
                    "</div></div><span class='modal-btns'><button id='modal-settings-confirm'>Confirm</button><button id='modal-settings-download'>Download</button></span></div>";
                let parser = new DOMParser();
                str = str.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
                let domPrototype = parser.parseFromString(str, "text/html");
                document.querySelector(".modal > .modal_panel > .modal_content").innerHTML = "";
                document.querySelector('.modal > .modal_panel > .modal_content').appendChild(domPrototype.body.childNodes[0])
                $("#modal-settings-confirm").click(function () {
                    let width = document.getElementById("obj-width").value;
                    let height = document.getElementById("obj-height").value;
                    let offX = document.getElementById("obj-offsetx").value;
                    let offY = document.getElementById("obj-offsety").value;
                    if ((width == "" || DataSchema.isNumber(width)) && (height == "" || DataSchema.isNumber(height)) && (offX == "" || DataSchema.isNumber(offX)) && (offY == "" || DataSchema.isNumber(offY))) {
                        if (height)
                            animationOptions.height = height;
                        if (width)
                            animationOptions.width = width;
                        if (offX)
                            animationOptions.dy = offY;
                        if (offY)
                            animationOptions.dx = offX;
                        let fontSize = document.getElementsByName("font-size");
                        fontSize.forEach((f, i)=> {
                            if (f.checked == true) {
                                animationOptions.fontSize = f.value;
                            }
                        });
                        let animeSpd = document.getElementsByName("speed");
                        animeSpd.forEach((spd, i)=> {
                            if (spd.checked == true) {
                                animationOptions.speed = parseInt(spd.value);
                            }
                        });
                        let animeTrans = document.getElementById("animation-type");
                        if (animeTrans.value)
                            animationOptions.transition = animeTrans.value;
                        $(".modal").removeClass("active");
                    } else {
                        alert("Please enter number!")
                    }
                });

                $("#modal-settings-download").click(function () {
                    let json = {
                        domains: {
                            "BLOCKSWORLD": blocksWorldMappings,
                            "GRIPPER": gripperMappings
                        },
                        animationOptions: animationOptions,
                        argsToPriorityMapping: argsToPriorityMapping,
                        currentDomain: defaultSettings.currentDomain ? defaultSettings.currentDomain : "BLOCKSWORLD",
                        templatesMapping: templatesMapping
                    };
                    let f = new File([JSON.stringify(json, function (key, val) {
                        if (typeof val == 'function')
                            return val.toString();
                        return val;
                    }).replace(/\\n/g, "").trim()], "planimation_settings.json");
                    let a = document.createElement('a');
                    a.download = "planimation_settings.json";
                    a.href = window.URL.createObjectURL(f);
                    document.body.appendChild(a);
                    a.click();
                });

                $(".modal").addClass("active");
            });
        })
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

/**
 * Play animation for axis
 * @play([speed])   speed in seconds
 * @clear()
 * */
var AxisPlayer = (function () {
    let timeoutStack = [];
    let _play = (speed = 500)=> {
        $(".element").each(function (i, d) {
            var _this = $(this);
            let ts = setTimeout(function () {
                _this.addClass("active");
            }, speed * i);
            let te = setTimeout(function () {
                _this.removeClass("active");
            }, speed * (i + 1));
            timeoutStack.push(ts);
            timeoutStack.push(te);
        });
    }

    let _clear = ()=> {
        timeoutStack.forEach((t)=> {
            clearTimeout(t);
            $(".element").each(function (i, d) {
                $(this).removeClass("active");
            });
        })
    }

    return {
        play: _play,
        clear: _clear
    }
}());

/**
 * Change image of object
 * @previewImage(imgSelector, file, callback);
 * */
const previewImage = (imgSelector, file, callback)=> {
    if (!imgSelector || !file)
        throw new Error("No Selector or File Error");

    let preview = null;
    if (typeof imgSelector == "string")
        preview = document.querySelector(imgSelector);
    else if (typeof imgSelector == "object")
        preview = imgSelector;
    else throw new Error("Selector Type not Recognizable Error");
    let reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result;
        if (callback)
            callback(reader.result);
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    }
}

let renderer = {};