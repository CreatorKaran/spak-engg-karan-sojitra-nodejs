
const hapiSwagger = require('hapi-swagger')
const inert = require('inert')
const vision = require('vision')
const config = require('../../config')

const swagger = {
  plugin: hapiSwagger,
  options: {
    schemes: ['http'],
    host: config.swagger.HOST,
    swaggerUIPath: '/v1/swaggerui/',
    jsonPath: '/v1/swagger.json',
    documentationPath: `/${config.server.VERSION}/doc`,
    grouping: 'tags',
    cors: true,
    debug: true,
    // payloadType: 'form',
    info: {
      title: config.swagger.TITLE,
      version: config.swagger.VERSION,
      contact: {
        name: config.swagger.AUTHORNAME,
        email: config.swagger.AUTHOREMAIL
      }
    }
  }
}

module.exports = { inert, vision, swagger }
