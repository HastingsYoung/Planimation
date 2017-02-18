/**
 * Created by hastings on 14/02/2017.
 */
var assert = require('assert');
describe('Presentation Layer', function () {
    describe('#Transformer', function () {
        it('should throw error if no argument is present', function () {
            try {
                let trsmer = Transformer.initiate();
            } catch (err) {
                assert.equal(1, 1);
            }
        });
        it('should transform actions to coordinates', function () {
            let solutions = [{
                name: "act1",
                parameters: [{value: "par1", name: "", type: ""}, {value: "par2", name: "", type: ""}]
            }];
            let actions = [{
                name: "act1",
                effects: [{
                    name: "pred1",
                    parameters: [{name: "?a", type: "", value: ""}, {name: "?b", type: "", value: ""}],
                    truthiness: "true"
                }],
                parameters: [{name: "?a", type: "", value: ""}, {name: "?b", type: "", value: ""}]
            }];
            let init = [{name: "pred1", args: ["pred1"], truthiness: "true"}];
            let mappings = [{
                name: "pred1", true_func: function (id, o1) {
                    return {id: id, x: o1.x, y: o1.y}
                }, false_func: function (id, o1) {
                    return {id: id, x: o1.x, y: o1.y}
                }
            }];
            let trsmer = Transformer.initiate(mappings, init, solutions, actions);
            let rst = trsmer.getInit();
            assert.equal(rst[0].id, 'pred1');
            assert.equal(rst[0].x, 0);
            assert.equal(rst[0].y, 50);
        });
    });
});

var Transformer = (function () {
    var _initialStates = {};
    var _predicates = [];    // inherently they are functions that map last state to next state
    var _actions = {};
    var _solutions = [];   // store actual solutions objects to represent what is the next pair of coordinates
    var _dataArray = [];

    function _initiate(predicates, init, solutions, actions) {
        _clear();
        if (!init || !solutions || !predicates || !actions) {
            throw "Arguments Not Correct!";
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
            //if (init[i].args.length == 1) {
            if (init[i].args[0])
                _initialStates[init[i].args[0]] = {
                    id: init[i].args[0],
                    x: 50 * i,
                    y: 50
                };
            //}
        }

        // derivative cases
        var loopStack = [];
        for (var i in init) {
            if (init[i].args.length >= 1) {
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
                    if (init[i].truthiness == "true")
                    // init[i].args[0]: the first argument is always the argument to be operated on
                        _initialStates[init[i].args[0]] = _predicates[init[i].name].true(init[i].args[0], ...(init[i].args.map((p, index)=> {
                            return _initialStates[p];
                        })));
                    else
                        _initialStates[init[i].args[0]] = _predicates[init[i].name].false(init[i].args[0], ...(init[i].args.map((p, index)=> {
                            return _initialStates[p];
                        })));
                }
            }
        }

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
                // 1. map arguments in solution to function in initialStates
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
                    if (preObj.x != afterObj.x || preObj.y != afterObj.y)
                        stack.push(afterObj);
                }
                else {
                    let arr = (_solutions[s].args.map((sol, index)=> {
                        if (indices.length > 0)
                            return _initialStates[_solutions[s].args[indices[index]]];
                        return _initialStates[_solutions[s].args[index]];
                    }));
                    let preObj = arr[0];
                    let afterObj = _predicates[effs[e].name].false(arr[0].id, ...arr);
                    if (preObj.x != afterObj.x || preObj.y != afterObj.y)
                        stack.push(afterObj);
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