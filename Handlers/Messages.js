const {
  sendResponse,
  returnError,
  CREATED,
  NOT_ACCEPTABLE,
  SUCCESS,
  NOT_FOUND,
  SERVER_ERROR
} = require('../ResponseHandling')
const serviceHandler = require('../Config/services')
const logger = require('../Config/logger')

const addConversation = async (req, res) => {
  try {
    const senderId = req.body.id_from_token

    if (!senderId) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'user must be logged in to create a new conversation'
      })
    }

    if (
      !req.body.user_ids?.length ||
      req.body.user_ids.includes(null) ||
      req.body.user_ids.includes(undefined) ||
      req.body.user_ids.includes('') ||
      req.body.user_ids.includes(senderId)
    ) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message:
          'an array of user ids as numbers are required in the request body for a conversation to be created. The current user cannot be included'
      })
    }
    const userIds = [senderId, ...req.body.user_ids]

    req.logger.info('Creating a new conversation')

    const { conversation_exists, conversations } =
      await serviceHandler.messagingService.createConversation({
        userIds,
        senderId
      })

    logger.info(JSON.stringify({ conversation_exists, conversations }))

    return sendResponse({
      req,
      res,
      data: { conversations, conversation_exists },
      status: CREATED
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not create a conversation',
      error,
      status: SERVER_ERROR
    })
  }
}

const addUserToConversation = async (req, res) => {
  try {
    const { user_id, conversation_id } = req.body
    if (!(user_id && conversation_id)) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message:
          'a user_id and a conversation_id need to be specified to add the user to the conversation'
      })
    }

    logger.info(`Adding new user to conversation ${conversation_id}`)

    const { newUserConversations, newUser } =
      await serviceHandler.messagingService.expandConversation({
        userId: user_id,
        conversationId: conversation_id
      })

    logger.info(
      JSON.stringify({
        newUserToConversation: true,
        userId: user_id,
        conversationId: conversation_id
      })
    )

    return sendResponse({
      req,
      res,
      data: {
        user_added: true,
        new_user: newUser,
        new_user_conversations: newUserConversations,
        conversation_id
      },
      status: SUCCESS
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not add user to conversation',
      error,
      status: SERVER_ERROR
    })
  }
}

const getConversations = async (req, res) => {
  try {
    const userId = req.body.id_from_token

    if (!userId) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message: 'a user must be logged in to get conversations'
      })
    }

    req.logger.info('getting all conversations')

    const conversations =
      await serviceHandler.messagingService.getConversationsPerUser({ userId })

    return sendResponse({ req, res, data: { conversations }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not get conversations',
      error,
      status: SERVER_ERROR
    })
  }
}

const deleteConversation = async (req, res) => {
  try {
    req.logger.info('delete conversation not ready')
    return returnError({
      req,
      res,
      message: 'endpoint not ready',
      status: NOT_FOUND
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not delete conversation',
      error,
      status: SERVER_ERROR
    })
  }
}

const getSpecificConversation = async (req, res) => {
  try {
    const conversationId = req.query.conversation_id
    const userId = req.body.id_from_token

    if (!conversationId) {
      return returnError({
        req,
        res,
        message: 'conversation_id parameter must be included in query',
        status: NOT_ACCEPTABLE
      })
    }

    const conversation = await serviceHandler.messagingService.getConversation({
      conversationId,
      userId
    })

    return sendResponse({ req, res, data: { conversation }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not get this conversation',
      error,
      status: SERVER_ERROR
    })
  }
}

module.exports = {
  getConversations,
  addConversation,
  deleteConversation,
  addUserToConversation,
  getSpecificConversation
}
