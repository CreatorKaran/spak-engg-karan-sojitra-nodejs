
const joi = require('joi')

const envVarsSchema = joi.object({
  HOST: joi.string().required(), 
  PORT: joi.number().required(),
  VERSION: joi.string().required()  
}).unknown().required()

const { error, value: envVars } = joi.validate(process.env, envVarsSchema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  server: {
    HOST: envVars.HOST,
    PORT: envVars.PORT,
    VERSION: envVars.VERSION
  }
}

module.exports = config
