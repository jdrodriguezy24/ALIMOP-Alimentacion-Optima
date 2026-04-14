export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: ['node_modules/(?!(supertest)/)'],
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.routes.js',
        '!src/config/**'
    ],
    testTimeout: 10000,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
};