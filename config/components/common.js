
const joi = require('joi')

const envVarsSchema = joi.object({
  AUTH_KEY: joi.string().required(),
  ACCESSTTL: joi.string().required()
}).unknown().required()

const { error, value: envVars } = joi.validate(process.env, envVarsSchema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  AUTH_KEY: envVars.AUTH_KEY,
  ACCESSTTL: envVars.ACCESSTTL
}

module.exports = config
