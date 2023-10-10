module.exports = {
    moduleNameMapper: {
        '^@angular-redux3/store$': '<rootDir>/projects/angular-redux2/store/src/public-api.ts',
        '^@angular-redux3/store/mocks$': '<rootDir>/projects/angular-redux2/store/mocks/public-api.ts',
    },
    modulePathIgnorePatterns: [
        '<rootDir>/dist',
        '<rootDir>/package.json'
    ],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
};
