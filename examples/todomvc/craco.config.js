// https://github.com/rjerue/craco-babel-loader/blob/master/src/index.js
const { getLoader, loaderByName } = require("@craco/craco");
const path = require('path')
//  https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
module.exports = {
  webpack: {
    configure: webpackConfig => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
       const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
      if (isFound) {
        const includes = Array.isArray(match.loader.include ) ? match.loader.include : [match.loader.include ].filter(Boolean)
        match.loader.include  = includes.concat(path.resolve(__dirname, '..', '..', 'packages', 'astore', 'src'))
      }
      return webpackConfig;
    }
  }
};
