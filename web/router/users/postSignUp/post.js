const Joi = require('joi')
const moment = require('moment')
const { ObjectID } = require('mongodb')

const bcrypt = require('bcrypt');

const config = require('../../../../config')
const usersDb = require('../../../../models/users')
const userTokenDb = require('../../../../models/userToken')
const logger = require('../../../commonModels/logger')
const i18n = require('../../../../locales')
const auth = require('../../../middleware/auth');

const payloadValidate = Joi.object({
  firstName:
    Joi.string().example('John').description('firstName : John').required(),
  lastName:
    Joi.string().example('Corner').description('lastName : Corner').default('').allow(''),
  password:
    Joi.string().example('12345').description('password : 12345').required(),
  mobile:
    Joi.string().example('9988776655').description('mobile : 9988776655').required(),
  gender:
    Joi.string().example('Male').allow(['Male', 'Female', 'Others']).description('gender : Male').required(),
  country:
    Joi.string().example('India').description('country : India').required(),
})

const handler = async (req, h) => {
  logger.debug('payload..', req.payload)
  const userId = new ObjectID()

  const checkUserDetails = () => new Promise((resolve, reject) => {
    logger.info('checkUserDetails')

    const condition = {
      mobile: req.payload.mobile
    }
    return usersDb.getAll(condition)
      .then(data => {
        if (data.length > 0) reject({ message: i18n.__('users.response.409')['unique'], code: 409 })
        resolve()
      })
      .catch((err) => reject(err))
  })

  const addUser = () => new Promise(async (resolve, reject) => {
    logger.info('addUser')

    const originalPassword = req.payload.password
    req.payload.password = await bcrypt.hash(
      req.payload.password,
      Number(10)
    )

    const insertData = {
      _id: userId,
      userId: String(userId),
      firstName: req.payload.firstName,
      lastName: req.payload.lastName,
      originalPassword: originalPassword,
      password: req.payload.password,
      mobile: req.payload.mobile,
      gender: req.payload.gender,
      country: req.payload.country,
      createdOnDt: moment().toDate(),
      createdOn: moment().unix()
    }
    return usersDb.insertOne(insertData)
      .then(data => {
        resolve(data.ops[0])
      })
      .catch((err) => reject(err))
  })

  const generateResponse = (user) => new Promise((resolve) => {
    logger.info('generateResponse')

    const response = {
      _id: userId,
      userId: String(userId),
      firstName: req.payload.firstName,
      lastName: req.payload.lastName,
      token: '',
      mobile: req.payload.mobile,
      gender: user.gender,
      country: user.country,
      createdOnDt: user.createdOnDt,
      createdOn: user.createdOn
    }

    return resolve(response)

  })

  const genrerateToken = (response) => new Promise((resolve, reject) => {
    logger.info('genrerateToken')

    const authData = {
      userId: response.userId,
      userType: 'user',
      accessTTL: config.ACCESSTTL
    }

    return auth.generateTokens(authData)
      .then(async (data) => {
        response.token = data

        const userTokenData = {
          userId: response.userId,
          token: data,
          createdAt: moment().unix()
        }

        await userTokenDb.insertOrUpdate({ userId: response.userId }, { $set: userTokenData })  // add issued token data to db to delete later on logout

        return resolve(response)
      })
      .catch(err => reject(err))
  })

  return checkUserDetails()
    .then(addUser)
    .then(generateResponse)
    .then(genrerateToken)
    .then((data) => {
      return h.response({
        message: i18n.__('common.response')['200'],
        data: data
      }).code(200)
    })
    .catch((err) => {
      logger.error('errrr...', err)

      if (err instanceof Error) {
        return h.response({ message: i18n.__('common.response')['500'] }).code(500)
      }
      return h.response({ message: err.message }).code(err.code)
    })
}

const responseValidate = {
  status: {
    500: Joi.object({
      message: Joi.any().example(i18n.__('common.response.500')).description(i18n.__('common.responseDescription.500'))
    }).description(i18n.__('common.responseDescription.500')),
    400: Joi.object({
      message: Joi.any().example(i18n.__('common.response.400')).description(i18n.__('common.responseDescription.400'))
    }).description(i18n.__('common.responseDescription.400')),
    409: Joi.object({
      message: Joi.any().example(i18n.__('users.response.409.unique')).description(i18n.__('common.responseDescription.409'))
    }).description(i18n.__('common.responseDescription.409')),
    200: Joi.object({
      message: Joi.any().example(i18n.__('common.response.200')).description(i18n.__('common.responseDescription.200')),
      data: Joi.object({
        _id: '6069700d845630355064246d',
        userId: '6069700d845630355064246d',
        firstName: 'John',
        lastName: 'Corner',
        token: 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDcxY2E3O',
        countryCode: '+91',
        mobile: '9988776655',
        email: 'john@gmail.com',
        createdOnDt: '2021-04-04T07:51:41.344Z',
        createdOn: '1617522701'
      })
    }).description(i18n.__('common.responseDescription.200'))
  },
  failAction: 'log'
}// swagger response code

module.exports = {
  payloadValidate,
  handler,
  responseValidate
}
