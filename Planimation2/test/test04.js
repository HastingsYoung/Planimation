/**
 * Created by hastings on 14/02/2017.
 */
var assert = require('assert');
describe('Presentation Layer', function () {
    describe('#Component', function () {
        it('should throw error if no argument input', function () {
            try {
                let cp = new Component();
            } catch (err) {
                assert.equal(1, 1);
                return true;
            }
            assert.equal(1, 0);
            return false;
        });
        it('should be able to create component', function () {
            let cp = new Component({"key1":"val1","key2":"val2"});
        });
    });
});

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