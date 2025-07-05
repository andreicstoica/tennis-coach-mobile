const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.assetExts = ['png', 'jpg', 'ttf', 'otf', 'woff', 'woff2'];

module.exports = withNativeWind(config, { input: './global.css' });
