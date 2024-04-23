const isDefined = (...values) => {
  return !values.some((value) => [undefined, null].includes(value))
}

const checkPathObj = (path) => {
  if (!Array.isArray(path)) {
    throw 'the path field must be an array of objects defined as [lng, lat]'
  }

  if (!path.length) {
    // resetting the path
    return true
  }

  if (!Array.isArray(path[0])) {
    throw 'the path field must be an array of objects defined as [lng, lat]'
  }
}

const checkElevationsObj = (elevations) => {
  if (!Array.isArray(elevations)) {
    throw 'the elevations field must be an array of numbers'
  }
}

const convertPathObject = (path) => {
  return JSON.stringify(path)
}

const numFields = [
  'avg_angle',
  'max_angle',
  'summit_elevation',
  'base_elevation',
  'exposure',
  'pitches',
  'climb',
  'descent',
  'coordinates_lat',
  'coordinates_lng',
  'public'
]

module.exports = {
  isDefined,
  checkPathObj,
  convertPathObject,
  checkElevationsObj,
  numFields
}
