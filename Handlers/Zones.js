const { validationResult } = require('express-validator')
const serviceHandler = require('../Config/services')
const {
  returnError,
  SERVER_ERROR,
  NOT_ACCEPTABLE,
  sendResponse,
  SUCCESS,
  CREATED
} = require('../ResponseHandling')

const getAllZones = async (req, res) => {
  try {
    const adventureType = req.query?.adventure_type

    if (!adventureType) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'adventure_type parameter required in request header'
      })
    }

    const allZones = await serviceHandler.zoneService.getAllZonesPerType({
      adventureType
    })

    return sendResponse({ req, res, data: allZones, status: SUCCESS })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const getZone = async (req, res) => {
  try {
    const zoneId = req.query?.zone_id

    if (!zoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'zone_id query parameter required in request header'
      })
    }
    const zone = await serviceHandler.zoneService.getZoneData({ zoneId })
    return sendResponse({ req, res, data: { zone }, status: SUCCESS })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const createZone = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        error: errors.array()[0]
      })
    }

    const zoneParams = {
      adventureType: req.body.adventure_type,
      zoneName: req.body.zone_name,
      nearestCity: req.body.nearest_city,
      coordinatesLat: req.body.coordinates_lat,
      coordinatesLng: req.body.coordinates_lng,
      public: req.body.public,
      creatorId: req.body.id_from_token
    }

    const zone = await serviceHandler.zoneService.createNewZone({ zoneParams })

    return sendResponse({ req, res, data: { zone }, status: CREATED })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const addChild = async (req, res) => {
  try {
    const parentZoneId = req.body?.parent_zone_id
    const adventureId = req.body?.adventure_id
    const childZoneId = req.body?.child_zone_id
    const childType = req.body?.child_type

    if (!childType || !['zone', 'adventure'].includes(childType)) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'child_type parameter must be one of "zone", or "adventure"'
      })
    }

    if (!parentZoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'parent_zone_id field is required'
      })
    }

    if (!adventureId && !childZoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'child_zone_id or adventure_id field is required'
      })
    }

    if (
      (childType === 'zone' && !childZoneId) ||
      (childType === 'adventure' && !adventureId)
    ) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'the child_type and the child id type need to match'
      })
    }

    let modifiedZone = null

    if (childType === 'adventure') {
      const compatibleTypes =
        await serviceHandler.zoneService.getMatchingAdventures({
          adventureId,
          zoneId: parentZoneId
        })

      if (compatibleTypes) {
        modifiedZone = await serviceHandler.zoneService.addAdventure({
          zoneId: parentZoneId,
          adventureId
        })
      } else {
        throw returnError({
          req,
          res,
          status: NOT_ACCEPTABLE,
          message:
            'your adventure type and zone type are not compatible to be in the same group'
        })
      }
    } else {
      const compatibleTypes = await serviceHandler.zoneService.getMatchingZones(
        { parentZoneId, childZoneId }
      )

      if (compatibleTypes) {
        modifiedZone = await serviceHandler.zoneService.addSubzone({
          parentZoneId,
          childZoneId
        })
      } else {
        throw returnError({
          req,
          res,
          status: NOT_ACCEPTABLE,
          message: 'your zone types are not compatible to be in the same group'
        })
      }
    }

    return sendResponse({
      req,
      res,
      data: { zone: modifiedZone },
      status: CREATED
    })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const editMetaData = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        error: errors.array()[0]
      })
    }

    const editObject = req.body?.field

    if (editObject.editName === 'coordinates') {
      await serviceHandler.zoneService.editZone({
        editField: 'coordinates_lat',
        editValue: editObject.coordinates.lat,
        editZoneId: editObject.editZoneId
      })

      await serviceHandler.zoneService.editZone({
        editField: 'coordinates_lng',
        editValue: editObject.coordinates.lng,
        editZoneId: editObject.editZoneId
      })
    } else {
      await serviceHandler.zoneService.editZone(editObject)
    }

    return sendResponse({
      req,
      res,
      data: { zone_id: editObject.editZoneId },
      status: SUCCESS
    })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const removeChild = async (req, res) => {
  try {
    const childType = req.body?.child_type
    const parentZoneId = req.body?.parent_zone_id
    const childZoneId = req.body?.child_zone_id
    const adventureId = req.body?.adventure_id

    if (!childType || !['zone', 'adventure'].includes(childType)) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'child_type parameter must be one of "zone", or "adventure"'
      })
    }

    if (!parentZoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'parent_zone_id field is required'
      })
    }

    if (!adventureId && !childZoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'child_zone_id or adventure_id field is required'
      })
    }

    let modifiedAdventure = null

    if (childType === 'adventure') {
      modifiedAdventure = await serviceHandler.zoneService.removeAdventure({
        adventureId,
        zoneId: parentZoneId
      })
    } else {
      modifiedAdventure = await serviceHandler.zoneService.removeSubzone({
        childZoneId,
        parentZoneId
      })
    }

    return sendResponse({
      req,
      res,
      data: { adventure: modifiedAdventure },
      status: SUCCESS
    })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const deleteZone = async (req, res) => {
  try {
    const zoneId = req.query?.zone_id

    if (!zoneId) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'zone_id query parameter is required'
      })
    }

    const children = await serviceHandler.zoneService.deleteZone({ zoneId })
    return sendResponse({
      req,
      res,
      status: SUCCESS,
      data: { zone_children: children }
    })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

module.exports = {
  getAllZones,
  getZone,
  createZone,
  addChild,
  editMetaData,
  removeChild,
  deleteZone
}
