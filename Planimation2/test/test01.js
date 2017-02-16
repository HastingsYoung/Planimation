/**
 * Created by hastings on 14/02/2017.
 */

var assert = require('assert');
describe('Data Mapping Layer', function () {
    describe('#DataSchema', function () {
        it('should throw error when no argument is present', function () {
            try {
                let ds = new DataSchema();
            } catch (err) {
                assert.equal(1, 1);
                return true;
            }
            assert.equal(1, 0);
        });
        it('should validate through corresponding types', function () {
            let ds = new DataSchema({
                keyString: {
                    type: "String"
                },
                keyInteger: {
                    type: "Number"
                },
                keyFloat: {
                    type: "Number"
                },
                keyArray: {
                 type: "Array"
                 },
                keyFunction: {
                    type: "Function"
                }
            });
            assert.equal(ds.validate({
                keyString: "Test String",
                keyInteger: 123,
                keyFloat: 123.123,
                keyArray: [1, 2, 3],
                keyFunction: function () {
                    // test function
                }
            }), true);
        });
    });
});

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