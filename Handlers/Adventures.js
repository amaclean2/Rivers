const { validationResult } = require('express-validator')
const logger = require('../Config/logger')

const serviceHandler = require('../Config/services')
const { returnError, sendResponse } = require('../ResponseHandling')
const {
  SUCCESS,
  NO_CONTENT,
  CREATED,
  NOT_ACCEPTABLE
} = require('../ResponseHandling/statuses')

const createNewAdventure = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw returnError({ req, res, error: errors.array()[0] })
    }

    logger.info(`Creating a new adventure of type: ${req.body?.adventure_type}`)

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
    return returnError({ req, res, message: 'serverCreateAdventure', error })
  }
}

const importBulkData = async (req, res) => {
  try {
    const { adventures, id_from_token } = req.body

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
      error
    })
  }
}

// this function uses adventure types
const getAllAdventures = async (req, res) => {
  try {
    // handle the response from the validation middleware
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw returnError({ req, res, error: errors.array()[0] })
    }

    // get the parameters from the request body
    const { type } = req.query

    if (!type) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'type query prameter required'
      })
    } else if (
      !['ski', 'hike', 'bike', 'skiApproach', 'climb'].includes(type)
    ) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'type query parameters must be one of the supported types'
      })
    }

    const adventures = await serviceHandler.adventureService.getAdventureList({
      adventureType: type
    })

    return sendResponse({ req, res, data: { adventures }, status: SUCCESS })
  } catch (error) {
    return returnError({ req, res, error, message: 'serverGetAdventures' })
  }
}

const searchAdventures = async (req, res) => {
  try {
    const { search } = req.query

    if (!search) {
      throw 'The search query parameter is required to search for an adventure'
    }

    const adventures =
      await serviceHandler.adventureService.searchForAdventures({ search })

    return sendResponse({
      req,
      res,
      data: { adventures, search },
      status: SUCCESS
    })
  } catch (error) {
    return returnError({ req, res, error, message: 'serverGetAdventures' })
  }
}

const getAdventuresByDistance = async (req, res) => {
  try {
    const { coordinates_lat, coordinates_lng, adventure_type, count } =
      req.query
    if (!(coordinates_lat && coordinates_lng && adventure_type)) {
      throw 'Coordinates_lat and coordinates_lng and adventure_type are required in the query parameters. Count is optional'
    }

    const coordinates = {
      lat: Number(coordinates_lat),
      lng: Number(coordinates_lng)
    }

    const adventures =
      await serviceHandler.adventureService.getClosestAdventures({
        adventureType: adventure_type,
        coordinates,
        count: Number(count)
      })

    return sendResponse({ req, res, data: { adventures }, status: SUCCESS })
  } catch (error) {
    return returnError({ req, res, error, message: 'serverGetAdventures' })
  }
}

const getAdventureDetails = async (req, res) => {
  try {
    const { id, type } = req.query
    if (!id || !type) {
      throw returnError({
        req,
        res,
        message: 'adventure id and type fields are required'
      })
    }

    logger.info(
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
      error
    })
  }
}

const editPath = async (req, res) => {
  try {
    const { field } = req.body
    if (!field) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'field property must be included in the body'
      })
    }

    if (!field.path || !field.elevations) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'path property and elevations must be in the field'
      })
    }

    if (!field.adventure_id || !field.adventure_type) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message:
          'adventure_id and adventure_type properties must be in the field'
      })
    }

    if (!Array.isArray(field.path || !Array.isArray(field.elevations))) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'path and elevations must be arrays'
      })
    }

    field.path = JSON.stringify(field.path)
    field.elevations = JSON.stringify(field.elevations)

    logger.info(`starting path edit for ${field.adventure_id}`)

    const editResponse = await serviceHandler.adventureService.editAdventure({
      field
    })

    logger.info(`finished path edit for ${field.adventure_id}`)

    return sendResponse({ req, res, data: editResponse, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'Server Error: could not edit path',
      error
    })
  }
}

const editAdventure = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw returnError({ req, res, error: errors.array()[0] })
    }

    let editResponse

    if (req.body.field) {
      editResponse = await serviceHandler.adventureService.editAdventure(
        req.body
      )
    } else if (req.body.fields) {
      editResponse = []

      for (const field of req.body.fields) {
        logger.info('starting next database update for adventures')
        editResponse.push(
          await serviceHandler.adventureService.editAdventure({ field })
        )
      }
    } else {
      throw returnError({
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
      error
    })
  }
}

const processCSV = async (req, res) => {
  try {
    const { csvString } = req.body
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
      error
    })
  }
}

const deleteAdventure = async (req, res) => {
  try {
    const { adventure_id, adventure_type } = req.query

    await serviceHandler.adventureService.deleteAdventure({
      adventureId: Number(adventure_id),
      adventureType: adventure_type
    })

    return sendResponse({ req, res, data: {}, status: NO_CONTENT })
  } catch (error) {
    return returnError({ req, res, message: 'serverDeleteAdventure', error })
  }
}

const deletePath = async (req, res) => {
  try {
    const { adventure_id, adventure_type } = req.query
    await serviceHandler.adventureService.editAdventure({
      field: { path: '[]', adventure_id, adventure_type }
    })
    return sendResponse({ req, res, status: NO_CONTENT })
  } catch (error) {
    return returnError({ req, res, message: 'serverDeleteAdventure', error })
  }
}

module.exports = {
  getAllAdventures,
  searchAdventures,
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
