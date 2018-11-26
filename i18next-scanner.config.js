const fs = require('fs');
const chalk = require('chalk');
const core = require('@babel/core');

module.exports = {
    options: {
        debug: true,
        func: {
            list: ['T'],
            extensions: ['.js', '.jsx']
        },
        lngs: ['ko', 'fr'],
        defaultValue: '__STRING_NOT_TRANSLATED__',
        nsSeparator: false, // namespace separator
        keySeparator: false, // key separator
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
