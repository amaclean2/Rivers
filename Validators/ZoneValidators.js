const { body, validationResult } = require('express-validator')
const {
  requireAdventureType,
  requireAdventureCoordinates,
  requireAdventurePublic,
  requireAdventureNearestCity
} = require('./AdventureValidators/AdventureCreateValidator')
const { returnError, NOT_ACCEPTABLE } = require('../ResponseHandling')

const requireZoneName = body('zone_name').custom((value) => {
  if (!value) throw 'zone_name field is required'

  if (typeof value !== 'string') throw 'zone_name field must be a string'

  return true
})

const zoneCreateValidator = () => {
  return [
    requireAdventureType,
    requireZoneName,
    requireAdventureCoordinates,
    requireAdventurePublic,
    requireAdventureNearestCity,
    (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return returnError({
          req,
          res,
          status: NOT_ACCEPTABLE,
          error: errors.array()[0]
        })
      }
    }
  ]
}

const editableFieldValues = [
  'zone_name',
  'bio',
  'approach',
  'coordinates',
  'nearest_city',
  'public'
]

const validateFieldValue = (value, { req }) => {
  const fieldName = req.body.field.field_name

  if (fieldName === 'coordinates') {
    if (!value.lat || !value.lng) {
      throw new Error(
        'coordinates must be an object containing lat and lng properties'
      )
    }
  } else if (fieldName === 'public') {
    if (typeof value != 'boolean') {
      throw new Error('public value must be true or false')
    }
  } else if (typeof value != 'string') {
    throw new Error('field_value must be a string')
  }

  return true
}

const customSanitizer = (req, _, next) => {
  if (req.body?.field) {
    req.body.formatted_field = {
      editField: req.body.field.field_name,
      editValue: req.body.field.field_value,
      editZoneId: req.body.field.zone_id
    }
  }

  next()
}

const zoneEditValidator = () => {
  return [
    body('field').isObject().withMessage('field object required in body'),
    body('field.field_name')
      .exists()
      .withMessage('field_name is required')
      .isString()
      .withMessage('field_name must be a string')
      .isIn(editableFieldValues)
      .withMessage(
        `editable zone fields are only ${editableFieldValues.join(', ')}`
      ),
    body('field.field_value')
      .exists()
      .withMessage('field_value is required')
      .custom(validateFieldValue),
    body('field.zone_id')
      .exists()
      .withMessage('zone_id is required')
      .isInt()
      .withMessage('zone_id must be an integer'),
    customSanitizer,
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return returnError({
          req,
          res,
          status: NOT_ACCEPTABLE,
          error: errors.array()[0]
        })
      }

      next()
    }
  ]
}

module.exports = {
  zoneCreateValidator,
  zoneEditValidator
}
