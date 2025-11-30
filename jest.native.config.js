export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
            module: "esnext",
            target: "esnext",
            allowJs: true
        }
      },
    ],
  },
  testMatch: ["<rootDir>/src/features/jest/test/native_usage.test.ts"],
  setupFilesAfterEnv: ["./src/features/jest/empty_setup.ts"],
};
