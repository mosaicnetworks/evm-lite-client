"use strict";
exports.__esModule = true;
var Chalk = require("chalk");
var path = require("path");
var Globals = /** @class */ (function () {
    function Globals() {
    }
    Globals.success = function (message) {
        console.log(Chalk["default"].green(message));
    };
    Globals.warning = function (message) {
        console.log(Chalk["default"].yellow(message));
    };
    Globals.error = function (message) {
        console.log(Chalk["default"].red(message));
    };
    Globals.info = function (message) {
        console.log(Chalk["default"].blue(message));
    };
    Globals.isEquivalentObjects = function (objectA, objectB) {
        var aProps = Object.getOwnPropertyNames(objectA);
        var bProps = Object.getOwnPropertyNames(objectB);
        if (aProps.length !== bProps.length) {
            return false;
        }
        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            if (typeof objectA[propName] === 'object' && typeof objectB[propName] === 'object') {
                if (!Globals.isEquivalentObjects(objectA[propName], objectB[propName])) {
                    return false;
                }
            }
            else if (objectA[propName] !== objectB[propName]) {
                return false;
            }
        }
        return true;
    };
    Globals.evmlcDir = path.join(require('os').homedir(), '.evmlc');
    return Globals;
}());
exports["default"] = Globals;
