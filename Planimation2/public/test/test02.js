/**
 * Created by hastings on 14/02/2017.
 */

var assert = require('assert');
describe('Data Mapping Layer', function () {
    describe('#PriorityQueue', function () {
        it('should throw error if received unrecognized argument', function () {
            try {
                let pq = new PriorityQueue([{}]);
            } catch (err) {
                assert.equal(1,1);
                return true;
            }
            assert.equal(1,0);
            return false;
        });
        it('should sort elements in order',function(){
            let pq = new PriorityQueue();
            pq.insert(4,"Value A");
            pq.insert(2,"Value B");
            pq.insert(5,"Value C");
            pq.insert(0,"Value D");
            assert.deepEqual(pq.values,["Value A","Value B","Value C","Value D"]);
            assert.deepEqual(pq.sortedValues,["Value D","Value B","Value A","Value C"]);
            assert.deepEqual(pq.sortedValuesDesc,["Value D","Value B","Value A","Value C"].reverse());
        });
    });
});

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