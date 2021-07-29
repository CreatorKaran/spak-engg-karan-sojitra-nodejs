
const Hapi = require('hapi')
const middleware = require('./middleware')
const config = require('../config')
const logger = require('./commonModels/logger')
const mongodb = require('../library/mongodb')

// create new server instance and connection information
const server = new Hapi.Server({
  port: config.server.PORT,
  host: config.server.HOST,
  routes: {
    validate: {
      failAction: middleware.validator.failAction
    }
  }
})

const init = async () => {
  await server.register([
    middleware.good,
    middleware.swagger.inert,
    middleware.swagger.vision,
    middleware.swagger.swagger,
    middleware.auth,
    middleware.authScheme,
    middleware.localization.i18n,
    middleware.preResponse
  ])

  await server.register([
    {
      plugin: require('./router'),
      routes: {
        prefix: `/${config.server.VERSION}/`
      }
    }
  ])
  await server.initialize()
  return server
}

exports.start = async () => {
  try {
    await init()
    await mongodb.connect()
    await server.start()


    logger.info(`Server started → ${server.info.uri}`)
  } catch (err) {
    console.log(err)
    logger.error(`[Server] : Server starting error... ${err}`)
    process.exit(1)
  }
  return server
}

exports.stop = async () => {
  await server.stop()
  console.debug('Server stopped')
}
