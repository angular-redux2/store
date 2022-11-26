module.exports = {
    moduleNameMapper: {
        '^@angular-redux2/store$': '<rootDir>/src/public-api.ts',
        '^@angular-redux2/store/testing$': '<rootDir>/testing/public-api.ts',
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
