const { body } = require('express-validator')
const { isDefined, checkPathObj, convertPathObject } = require('../utils')

const adventureEditValidator = () => {
  return [
    body('field')
      .custom((field) => {
        if (field === undefined) {
          throw 'field object containing name, value, adventure_id, and adventure_type must be present in the body'
        }

        const isCorrect = isDefined(
          field.name,
          field.value,
          field.adventure_id,
          field.adventure_type
        )

        // ensure the path object is an array of lat/lng arrays
        if (field.name === 'path') {
          checkPathObj(field.value)
        }

        // block a change if people have already been completing the activity
        if (field.name === 'difficulty') {
          const [difficultyValue, iterations] = field.value.split(':')
          if (Number(iterations) > 1) {
            throw 'difficulty cannot be edited once users have been completing the activity'
          }
          if (isNaN(Number(difficultyValue))) {
            throw 'the first value in difficulty needs to be a number formatted as a string'
          }
        }

        // block users from editing a rating
        if (field.name === 'rating') {
          throw 'rating cannot be edited'
        }

        if (!isCorrect) throw 'editFieldFormat'

        return true
      })
      .customSanitizer((field) => {
        if (
          [
            'distance',
            'exposure',
            'summit_elevation',
            'base_elevation'
          ].includes(field.name) &&
          typeof field.value !== 'number'
        ) {
          field.value = parseFloat(field.value)
        }

        if (field.name === 'path') {
          const trailPath = convertPathObject(field.value)

          field.name = 'trail_path'
          field.value = trailPath
        }
        if (field.name === 'distance') {
          if (field.adventure_type === 'ski') {
            field.name = 'approach_distance'
            field.value = field.value.toString()
          }
        }

        return field
      })
  ]
}

module.exports = { adventureEditValidator }
