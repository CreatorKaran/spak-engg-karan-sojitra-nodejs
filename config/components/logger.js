
const joi = require('joi')

const envVarsSchema = joi.object({
  LOGGER_LEVEL: joi.string()
    .allow(['silly'])
    .default('silly')


}).unknown().required()

const envVars = joi.attempt(process.env, envVarsSchema)

const config = {
  logger: {
    LEVEL: envVars.LOGGER_LEVEL
  }
}

module.exports = config
