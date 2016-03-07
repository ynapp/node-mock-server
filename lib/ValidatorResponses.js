
'use strict';

var util = require('util'),
	extend = util._extend,
	validatorLog = require('./ValidatorLog'),
	ValidatorResponse= require('./ValidatorResponse'),
	Utils = require('./Utils');

/**
 *
 * @class ValidatorResponses
 * @namespace ValidatorResponses
 * @param {object} options
 * @param {object} serverOptions
 * @constructor
 *
 * Swagger importer
 */
function ValidatorResponses(options, serverOptions) {
	this.init(options, serverOptions);
}

ValidatorResponses.prototype = extend(ValidatorResponses.prototype, Utils.prototype);
ValidatorResponses.prototype = extend(ValidatorResponses.prototype, {

	constructor : ValidatorResponses,

	_defaults: {
		restPath: ''
	},

	/**
	 *
	 * @method init
	 * called by constructor
	 * @param {object} options
	 * @param {object} serverOptions
	 * @public
	 */
	init: function (options, serverOptions) {

		options = extend(this._defaults, options || {});

		validatorLog.clear();
		validatorLog.neutral('response validation\'s started');

		this._options = options;
		this._serverOptions = serverOptions;
		this._validationResponses = this._getValidationResponses(this._options.restPath);
		this._runValidations(this._validationResponses);

	},

	/**
	 * @method _runValidations
	 * @param {Array} validationResponses
	 * @private
	 */
	_runValidations: function (validationResponses) {
		this.for(validationResponses, function (item) {
			this._runValidation(item);
		}.bind(this));
	},

	/**
	 * @method _runValidation
	 * @param {object} validation
	 * @param {string} validation.path
	 * @param {string} validation.method
	 * @param {string} validation.expected
	 * @private
	 */
	_runValidation: function (validation) {
		new ValidatorResponse({
			path: validation.path,
			method: validation.method,
			expected: validation.expected
		}, this._serverOptions);
	},

	/**
	 * @method _getValidationResponses
	 * @param {string} path
	 * @returns {Array} validationResponses
	 * @private
	 */
	_getValidationResponses: function (path) {
		var out = [],
			rootDirArray = this.readDir(path, ['.DS_Store', '_DTO']);

		this.for(rootDirArray, function (rootItem) {

			var pathDirArray = this.readDir(rootItem.path, ['.DS_Store']);
			this.for(pathDirArray, function (pathItem) {

				var path = pathItem.path;

				var methodDirArray = this.readDir(pathItem.path, ['.DS_Store']);
				this.for(methodDirArray, function (methodItem) {

					var method = methodItem.file;

					var mockDirArray = this.readDir(methodItem.path + '/mock', ['.DS_Store', 'response.txt']);
					this.for(mockDirArray, function (mockItem) {

						var isErrorFile = (mockItem.file.search(/error/g) >= 0),
							isStoreFile = (mockItem.file.search(/^\./g) >= 0);

						if (!isErrorFile && !isStoreFile) {
							out.push({
								path: path,
								method: method,
								expected: mockItem.file.replace('.json', '')
							});
						}

					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));

		return out;
	}

});

module.exports = ValidatorResponses;