//var array = localStorage.getItem('file_container');
//console.log(array);
let factory_instance = null;
class TemplateFactory {
    constructor() {
        if (!factory_instance) {
            factory_instance = this;
        }
        return factory_instance;
    };

    get newTemplate() {
        return `<div class="template"><div class="img"><img src="imgs/block.png" alt="N/A" height="50" width="50"></div><div class="name">block</div></div>`;
    }
}
;

var fct = new TemplateFactory();
console.log(fct.newTemplate);