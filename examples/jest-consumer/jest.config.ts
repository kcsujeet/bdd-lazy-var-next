import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./setup.ts"],
  testMatch: ["**/test/**/*.ts", "**/test/**/*.tsx"],
};

export default config;
