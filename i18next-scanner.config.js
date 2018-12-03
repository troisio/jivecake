module.exports = {
    options: {
        debug: true,
        func: {
            list: ['T'],
            extensions: ['.js', '.jsx']
        },
        lngs: ['ko', 'fr', 'es'],
        defaultValue: '__STRING_NOT_TRANSLATED__',
        nsSeparator: false, // namespace separator
        keySeparator: false, // key separator
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
