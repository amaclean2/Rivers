const { Router } = require('express')
const { addConversation, getConversations } = require('../../Handlers/Messages')
const { sendResponse, NOT_FOUND } = require('../../ResponseHandling')

const router = Router()

router.post('/', addConversation)
router.get('/', getConversations)
router.use('/', (req, res) => {
  return sendResponse({
    req,
    res,
    data: {
      message: 'Valid connections on conversations are "GET /", and "POST /"'
    },
    status: NOT_FOUND
  })
})

module.exports = router
