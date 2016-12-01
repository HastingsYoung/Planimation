//var array = localStorage.getItem('file_container');
// if arr = null window.location.href = ....;
//console.log(array);
let factory_instance = null;
class TemplateFactory {
    constructor(props) {
        if (!factory_instance) {
            if (props) {
                if (props.importSelector)
                    this.importSelector(props.importSelector);
                if (props.prototype)
                    this.prototype(props.prototype);
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

    prototype(pro) {
        if (typeof pro == "string") {
            pro = pro.replace(/>\s+([^\s<]*)\s+</g, '>$1<').trim();
            var obj = document.createElement("div");
            obj.innerHTML = pro;
            this._prototype = obj.childNodes[0];
        }
        else this._prototype = pro;
        return this;
    }

    newTemplate() {
        if (this._prototype)
            return this._prototype;
        else if (this._content) {
            this._prototype = this._content.querySelector(".template");
            return this._prototype;
        }
        throw "Prototype not defined!";
    }

    init() {
        this._prototype = null;
        this._link = null;
        this._content = null;
    }

    parseDom(str) {
        var obj = document.createElement("div");
        obj.innerHTML = str;
        return obj.childNodes;
    }
}
;
class Component {
    constructor(props) {
        if (props.name)
            this.name = props.name;
        if (props.parentSelector)
            this.parentSelector = props.parentSelector;
        if (props.node)
            this.node = props.node;
    }

    render() {
        document.querySelector(this.parentSelector).appendChild(this.node);
    }

    bind() {

    }
}

class Renderer {
    constructor(components) {
        this.components = components;
    }

    init() {
        for (var c in this.components) {
            var q = components[c].parentSelector;
            if (q)
                document.querySelector(q).innerHTML = "";
        }
        this.render();
    }

    render() {
        for (var c in this.components) {
            components[c].render();
        }
    }
}

var fct = new TemplateFactory({importSelector: "link[rel='import']"});
var components = [];
for (var i = 0; i < 30; i++) {
    components.push(new Component({
        name: 'block',
        parentSelector: '.preload',
        node: fct.newTemplate().cloneNode(true)
    }));
}

var renderer = new Renderer(components);
renderer.render();

// modules loading
