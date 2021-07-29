const goodLib = require('good')
// const logger = require('../commonModels/logger');

const good = {
  plugin: goodLib,
  options: {
    ops: false,
    reporters: {
      myConsoleReporter: [
        { module: 'good-console' },
        'stdout'
        // {
        // module: 'hapi-good-winston',
        // name: 'goodWinston',
        // args: [logger],
        // },
      ]
    }
  }
}

module.exports = good
