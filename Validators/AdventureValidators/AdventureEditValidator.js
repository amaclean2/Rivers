const { body } = require('express-validator')
const {
  isDefined,
  checkPathObj,
  convertPathObject,
  checkElevationsObj
} = require('../utils')

const adventureEditValidator = () => {
  return [
    body('field')
      .custom((field, { req }) => {
        if (field === undefined && !req.body.fields) {
          throw 'field object containing name, value, adventure_id, and adventure_type must be present in the body'
        } else if (field === undefined) {
          return true
        }

        const isCorrect = isDefined(
          field.name,
          field.value,
          field.adventure_id,
          field.adventure_type
        )

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

        if (!isCorrect)
          throw 'required fields are missing for single-property edit'

        return true
      })
      .customSanitizer((field) => {
        if (!field) {
          return field
        }

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

        if (field.name === 'distance') {
          if (field.adventure_type === 'ski') {
            field.name = 'approach_distance'
            field.value = field.value.toString()
          }
        }

        return field
      }),
    body('fields')
      .custom((fields) => {
        if (!fields) {
          return true
        }

        fields.forEach((field) => {
          const isCorrect = isDefined(
            field.name,
            field.value,
            field.adventure_id,
            field.adventure_type
          )

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

          if (!isCorrect)
            throw `required fields are missing for multiple-property edit, property: ${field.name}`
        })
        return true
      })
      .customSanitizer((fields) => {
        if (!fields) return fields

        return fields.map((field) => {
          const newField = { ...field }

          if (
            [
              'distance',
              'exposure',
              'summit_elevation',
              'base_elevation'
            ].includes(field.name) &&
            typeof field.value !== 'number'
          ) {
            newField.value = parseFloat(field.value)
          }

          if (field.name === 'distance') {
            if (field.adventure_type === 'ski') {
              newField.name = 'approach_distance'
              newField.value = field.value.toString()
            }
          }

          return newField
        })
      })
  ]
}

module.exports = { adventureEditValidator }
