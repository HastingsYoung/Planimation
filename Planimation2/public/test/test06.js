/**
 * Created by hastings on 17/02/2017.
 */
var assert = require('assert');
describe('Data Layer', function () {
    describe('#Rule', function () {
        it('should throw error if arguments are not recognizable', function () {
            try {
                let rule = new Rule();
            } catch (err) {
                assert.equal(1, 1);
                return ;
            }
            assert.equal(1, 0);
        });
        it('should be able to apply rule', function () {
            let rule = new Rule({
                name: "test_rule",
                func: function (a, b, c) {
                    return a + b + c;
                }
            });
            assert.equal(6, rule.apply(1, 2, 3));
        });
    });
});

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