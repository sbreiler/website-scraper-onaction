const _ = require('lodash');

const actionNames = [
    'beforeStart', 'afterFinish', 'error',
    'beforeRequest',
    'afterResponse',
    'onResourceSaved', 'onResourceError',
    // mandatory action - we won't touch them:
    // 'generateFilename',
    // 'getReference',
    // 'saveResource',
];

class OnEventPlugin {
    constructor(options) {
        const defaults = _.mapValues(_.keyBy(actionNames),e => null);

        this.options = _.defaults(
            options,
            defaults
        );
    }

    handle(actionName, ...args) {
        if( _.isFunction(this.options[actionName]) ) {
            return this.options[actionName](...args);
        }

        // if no handler is set, some actions need to return something!
        switch (actionName) {
            case 'beforeRequest':
                return {requestOptions: _.first(args).requestOptions};
            case 'afterResponse':
                return _.first(args).response.body;
        }
    }

    apply(registerAction) {
        // register every handled action
        _.forEach(actionNames, actionName => {
            registerAction(actionName, (...args) => this.handle(actionName, ...args));
        });
    }
}

module.exports = OnEventPlugin;