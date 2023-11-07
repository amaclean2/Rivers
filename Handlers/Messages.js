const {
  sendResponse,
  returnError,
  CREATED,
  NOT_ACCEPTABLE,
  SUCCESS
} = require('../ResponseHandling')
const serviceHandler = require('../Config/services')

const addConversation = async (req, res) => {
  try {
    if (
      !req.body.user_ids ||
      req.body.user_ids.length < 1 ||
      req.body.user_ids.includes(null) ||
      req.body.user_ids.includes(undefined) ||
      req.body.user_ids.includes('')
    ) {
      return returnError({
        req,
        res,
        status: NOT_ACCEPTABLE,
        message:
          'user ids formatted as numbers are required in the request body for a conversation to be created'
      })
    }

    const { id_from_token } = req.body
    const userIds = [id_from_token, ...req.body.user_ids]

    const { conversationId } =
      await serviceHandler.messagingService.createConversation({ userIds })
    return sendResponse({
      req,
      res,
      data: {
        conversation: {
          users: userIds.map((id) => ({
            user_id: id
          })),
          conversation_id: conversationId,
          last_message: '',
          unread: false
        }
      },
      status: CREATED
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not create a conversation',
      error
    })
  }
}

const getConversations = async (req, res) => {
  try {
    const { id_from_token } = req.body

    const { conversations } =
      await serviceHandler.messagingService.getConversationsPerUser({
        userId: id_from_token
      })

    return sendResponse({ req, res, data: { conversations }, status: SUCCESS })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'server error: could not get conversations',
      error
    })
  }
}

module.exports = {
  getConversations,
  addConversation
}
