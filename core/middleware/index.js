var webpack = require('webpack');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs-extra');
var specUtils = require(path.join(global.pathToApp,'core/lib/specUtils'));
var currentDir = path.dirname(__filename);

// Module configuration
var globalConfig = global.opts.plugins && global.opts.plugins.webpack ? global.opts.plugins.webpack : {};
var config = {
    enabled: true,

    // Public object is exposed to Front-end via options API.
    public: {}
};

/*
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
var processRequest = function (req, res, next) {
    if (!config.enabled) {
        next();
        return;
    }

    // Check if request is targeting Spec
    if (req.specData && req.specData.renderedHtml) {
        var specPath = specUtils.getFullPathToSpec(req.path);
        var jsxFilePath = path.join(specPath, 'src/index.jsx');
        var outputPath = path.join(specPath, 'build/index.js');
        var insertReactTpl = fs.readFileSync(path.join(currentDir, '../templates/insert-react.ejs'), 'utf-8');

        fs.outputFileSync(outputPath, ejs.render(insertReactTpl));

        //if (false) {
        if (fs.existsSync(jsxFilePath)) {
            webpack({
                entry: outputPath,
                output: {
                    filename: outputPath
                },
                debug: true,
                devtool: "#inline-source-map",
                module: {
                    loaders: [
                        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
                    ]
                },
                resolveLoader: {
                    root: path.join(currentDir, '../../node_modules')
                }
            }, function(err) {
                if (err) console.log('error', err);

                next();
            });

            req.specData.renderedHtml += '<script src="build/index.js"></script>';
        } else {
            next();
        }
    } else {
        next();
    }
};

exports.process = processRequest;