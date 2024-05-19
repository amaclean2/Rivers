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
    const adventureType = req.body?.adventure_type

    if (!adventureType) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'adventure_type parameter required in request body'
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
      throw returnError({ req, res, error: errors.array()[0] })
    }

    const newZone = req.body?.zone
    const creatorId = req.body?.id_from_token

    if (!newZone) {
      throw returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'zone object required in request body'
      })
    }

    const zone = await serviceHandler.zoneService.createNewZone({
      zoneParams: { ...newZone, creatorId }
    })

    return sendResponse({ req, res, data: { zone }, status: CREATED })
  } catch (error) {
    return returnError({ req, res, status: SERVER_ERROR, error })
  }
}

const addChild = async (req, res) => {
  try {
    const parentZoneId = req.body?.parent_zone_id ?? req.body?.parent_zone_id
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

    if (!req.body?.parentZoneId) {
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

    let modifiedZone = null

    if (childType === 'adventure') {
      modifiedZone = await serviceHandler.zoneService.addAdventure({
        zoneId: parentZoneId,
        adventureId
      })
    } else {
      modifiedZone = await serviceHandler.zoneService.addSubzone({
        parentZoneId,
        childZoneId
      })
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
      throw returnError({ req, res, error: errors.array()[0] })
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

    if (!req.body?.parentZoneId) {
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

module.exports = {
  getAllZones,
  getZone,
  createZone,
  addChild,
  editMetaData,
  removeChild
}
