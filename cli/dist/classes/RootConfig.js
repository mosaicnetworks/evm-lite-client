"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
const path = require("path");
const globals_1 = require("../utils/globals");
class RootConfig extends Config_1.default {
    constructor(configFilePath) {
        super(configFilePath, RootConfig.default());
    }
    static default() {
        return {
            storage: {
                configDirectory: path.join(globals_1.evmlcDir, 'config')
            }
        };
    }
}
exports.default = RootConfig;
