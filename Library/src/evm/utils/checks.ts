/**
 * @file checks.js
 * @author Mosaic Networks <https://github.com/mosaicnetworks>
 * @date 2018
 */

import * as errors from "./errors";

export const requireArgsLength = (expected: number, received: number): (boolean | Error) => {
    if (expected !== received) {
        throw errors.InvalidNumberOfSolidityArgs(expected, received);
    } else {
        return true
    }
};

export const requireSolidityTypes = (required, received): (boolean | Error) => {
    if (typeof received !== parseSolidityType(required)) {
        throw errors.InvalidSolidityType();
    } else {
        return true
    }
};

const parseSolidityType = (type: string): (string | undefined) => {
    switch (type.toLowerCase()) {
        case 'address':
            return 'string';
    }
    if (type.toLowerCase().includes('int')) {
        return 'number'
    }

    return undefined;
};
