const { body } = require('express-validator')
const {
  adventureTypes
} = require('./AdventureValidators/AdventureCreateValidator')

const zoneCreateValidator = () => {
  return [
    body('zone')
      .custom((value) => {
        if (!value)
          throw 'zone property must exist on requirest body for a new zone to be created'

        const zoneProperties = [
          'adventure_type',
          'zone_name',
          'coordinates',
          'public',
          'nearest_city'
        ]

        if (
          !zoneProperties.every((property) =>
            Object.values(value).includes(property)
          )
        )
          throw `${zoneProperties.join(', ')} must exist on the zone object`

        if (!adventureTypes.includes(value.adventure_type)) {
          throw `zone adventure_type must be one of ${adventureTypes.join(
            ', '
          )}.`
        }

        if (!(value.coordinates.lat && value.coordinates.lng)) {
          throw 'coordiantes must be an object conaining lat and lng properties'
        }

        return true
      })
      .customSanitizer((value) => {
        const convertedObject = {
          coordiantesLat: value.coordinates.lat,
          coordinatesLng: value.coordinates.lng,
          adventureType: value.adventure_type,
          zoneName: value.zone_name,
          nearestCity: value.nearest_city
        }

        return convertedObject
      })
  ]
}

const zoneEditValidator = () => {
  return [
    body('field')
      .custom((value) => {
        if (!value.field_name || typeof value.field_name !== 'string') {
          throw 'string field_name required on field object'
        }

        const editableFieldValues = [
          'zone_name',
          'bio',
          'coordiantes',
          'nearest_city',
          'public'
        ]

        if (!editableFieldValues.includes(value.field_name)) {
          throw `editable zone fields are only ${editableFieldValues.join(
            ', '
          )}.`
        }

        if (!value.field_value) {
          throw 'field_value required on field object'
        }

        if (value.field_name === 'coordinates') {
          if (!value.field_value.lat || !value.field_value.lng) {
            throw 'coordinates must be an object containing lat and lng properties'
          }
        }

        if (!value.zone_id) {
          throw 'zone_id required on field object'
        }

        return true
      })
      .customSanitizer((value) => {
        const sanitized = {
          editName: value.field_name,
          editValue: value.field_value,
          editZoneId: value.zone_id
        }

        if (sanitized.editName === 'public')
          sanitized.editValue = +sanitized.editValue

        return sanitized
      })
  ]
}

module.exports = {
  zoneCreateValidator,
  zoneEditValidator
}
