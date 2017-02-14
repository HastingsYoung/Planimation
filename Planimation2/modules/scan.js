const fs = require('fs');
const path = require('path');
exports.load_templates = function () {
    var _templates = [];
    var files = fs.readdirSync('./templates');
    (function () {
        for (var f in files) {
            var p = path.format({dir: './templates', base: files[f]});
            var fd = fs.readFileSync(p, 'utf8');
            _templates.push(fd);
        }
    })();
    return _templates;
}