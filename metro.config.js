const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const {
  withSentryConfig
} = require("@sentry/react-native/metro");

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {};
const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config);
module.exports = withSentryConfig(wrapWithReanimatedMetroConfig(mergedConfig));