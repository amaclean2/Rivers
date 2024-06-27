const { validationResult } = require('express-validator')

const serviceHandler = require('../Config/services')
const { returnError, sendResponse } = require('../ResponseHandling')
const {
  SUCCESS,
  NO_CONTENT,
  CREATED,
  NOT_ACCEPTABLE,
  SERVER_ERROR
} = require('../ResponseHandling/statuses')

const createNewAdventure = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        error: errors.array()[0]
      })
    }

    req.logger.info(
      `Creating a new adventure of type: ${req.body?.adventure_type}`
    )

    const { adventure, adventureList } =
      await serviceHandler.adventureService.createAdventure({
        adventureObject: req.body
      })

    return sendResponse({
      req,
      res,
      data: { adventure, all_adventures: adventureList },
      status: CREATED
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'serverCreateAdventure',
      error,
      status: SERVER_ERROR
    })
  }
}

const importBulkData = async (req, res) => {
  try {
    const { adventures, id_from_token } = req.body

    req.logger.info('Inserting many adventures')

    if (!adventures)
      throw 'an object with the key "adventures" needs to be provided'

    const sanitizedAdventures = adventures.map((adventure) => ({
      ...adventure,
      coordinates_lat: adventure.coordinates.lat,
      coordinates_lng: adventure.coordinates.lng,
      creator_id: id_from_token
    }))

    await serviceHandler.adventureService.bulkAdventureCreation({
      adventures: sanitizedAdventures
    })

    return sendResponse({
      req,
      res,
      data: { message: 'data imported successfully' },
      status: CREATED
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'The import of your data failed. Hope something here can help',
      status: SERVER_ERROR,
      error
    })
  }
}

// fetch all the adventures relative to a given adventure type
const getAllAdventures = async (req, res) => {
  try {
    // handle the response from the validation middleware
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return returnError({
        req,
        res,
        error: errors.array()[0],
        status: NOT_ACCEPTABLE
      })
    }

    const { type } = req.query

    if (!type) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'type query prameter required'
      })
    } else if (
      !['ski', 'hike', 'bike', 'skiApproach', 'climb'].includes(type)
    ) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'type query parameters must be one of the supported types'
      })
    }

    req.logger.info(`fetching all adventures of type ${req.query.type}`)

    const adventures = await serviceHandler.adventureService.getAdventureList({
      adventureType: type
    })

    return sendResponse({ req, res, data: { adventures }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      error,
      message: 'serverGetAdventures',
      status: SERVER_ERROR
    })
  }
}

const getAdventuresByDistance = async (req, res) => {
  try {
    const { lat, lng, type, count, zone_id } = req.query

    // zone_id specifies if the response is to include all adventues closest to the lat and lng
    // or only adventures that are not children of the zone

    const coordinatesLat = lat,
      coordinatesLng = lng,
      adventureType = type

    if (!(coordinatesLat && coordinatesLng && adventureType)) {
      throw 'lat, lng and type fields are required in the query parameters. count is optional'
    }

    const coordinates = {
      lat: Number(coordinatesLat),
      lng: Number(coordinatesLng)
    }

    req.logger.info(
      `getting adventures relative to coordinates {lat: ${coordinates.lat}, lng: ${coordinates.lng}} for adventure type: ${adventureType}`
    )

    const adventures =
      await serviceHandler.adventureService.getClosestAdventures({
        adventureType,
        coordinates,
        count: count ? Number(count) : 10,
        zoneId: zone_id ?? 0
      })

    return sendResponse({ req, res, data: { adventures }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      error,
      message: 'serverGetAdventures',
      status: SERVER_ERROR
    })
  }
}

const getAdventureDetails = async (req, res) => {
  try {
    const { id, type } = req.query
    if (!id || !type) {
      return returnError({
        req,
        res,
        message: 'adventure id and type fields are required',
        status: NOT_ACCEPTABLE
      })
    }

    req.logger.info(
      `getting adventure details for adventure ${id} of type: ${type}`
    )

    const adventure =
      await serviceHandler.adventureService.getSpecificAdventure({
        adventureId: id,
        adventureType: type
      })

    return sendResponse({ req, res, data: { adventure }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'serverGetAdventureDetails',
      error,
      status: SERVER_ERROR
    })
  }
}

const editPath = async (req, res) => {
  try {
    const { field } = req.body
    if (!field) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'field property must be included in the body'
      })
    }

    if (!field.path || !field.elevations) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'path property and elevations must be in the field'
      })
    }

    if (!field.adventure_id || !field.adventure_type) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message:
          'adventure_id and adventure_type properties must be in the field'
      })
    }

    if (!Array.isArray(field.path || !Array.isArray(field.elevations))) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'path and elevations must be arrays'
      })
    }

    field.path = JSON.stringify(field.path)
    field.elevations = JSON.stringify(field.elevations)

    req.logger.info(`starting path edit for ${field.adventure_id}`)

    const editResponse = await serviceHandler.adventureService.editAdventure({
      field
    })

    return sendResponse({ req, res, data: editResponse, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'Server Error: could not edit path',
      error,
      status: SERVER_ERROR
    })
  }
}

const editAdventure = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return returnError({
        req,
        res,
        error: errors.array()[0],
        status: NOT_ACCEPTABLE
      })
    }

    let editResponse

    if (req.body.fields) {
      editResponse = []

      for (const field of req.body.fields) {
        req.logger.info('starting next update for adventures')
        const resp = await serviceHandler.adventureService.editAdventure({
          field
        })
        if (resp.field.name.includes('coordinate')) {
          editResponse = {
            fields: req.body.fields,
            all_adventures: resp.all_adventures
          }
        } else {
          editResponse.push(resp)
        }
      }
    } else if (req.body.field) {
      req.logger.info(`editing adventure ${req.body.field.adventure_id}`)
      editResponse = await serviceHandler.adventureService.editAdventure(
        req.body
      )
    } else {
      return returnError({
        req,
        res,
        error: 'incorrect fields',
        status: NOT_ACCEPTABLE
      })
    }

    return sendResponse({
      req,
      res,
      data: editResponse,
      status: SUCCESS
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'Server Error: Could not edit the adventure',
      error,
      status: SERVER_ERROR
    })
  }
}

const processCSV = async (req, res) => {
  try {
    const { csvString } = req.body

    req.logger.info('csv string parsing')

    const jsonAdventureObject =
      await serviceHandler.adventureService.processCSVToAdventure({ csvString })

    return sendResponse({
      req,
      res,
      data: { adventures: jsonAdventureObject },
      status: SUCCESS
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'could not process this data',
      error,
      status: SERVER_ERROR
    })
  }
}

const deleteAdventure = async (req, res) => {
  try {
    const { adventure_id, adventure_type } = req.query

    req.logger.info(`deleting adventure ${adventure_id}`)

    await serviceHandler.adventureService.deleteAdventure({
      adventureId: Number(adventure_id),
      adventureType: adventure_type
    })

    return sendResponse({ req, res, data: {}, status: NO_CONTENT })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'serverDeleteAdventure',
      error,
      status: SERVER_ERROR
    })
  }
}

const deletePath = async (req, res) => {
  try {
    const { adventure_id, adventure_type } = req.query

    req.logger.info(`deleting path from adventure ${adventure_id}`)

    await serviceHandler.adventureService.editAdventure({
      field: { path: '[]', adventure_id, adventure_type }
    })
    return sendResponse({ req, res, status: NO_CONTENT })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'serverDeleteAdventure',
      error,
      status: SERVER_ERROR
    })
  }
}

module.exports = {
  getAllAdventures,
  processCSV,
  getAdventureDetails,
  importBulkData,
  createNewAdventure,
  editAdventure,
  editPath,
  deleteAdventure,
  deletePath,
  getAdventuresByDistance
}
