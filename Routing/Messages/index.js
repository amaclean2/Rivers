const { Router } = require('express')
const {
  addConversation,
  getConversations,
  deleteConversation,
  addUserToConversation,
  getSpecificConversation
} = require('../../Handlers/Messages')
const { sendResponse, NOT_FOUND } = require('../../ResponseHandling')

const router = Router()

router.post('/', addConversation)
router.post('/addUser', addUserToConversation)
router.get('/', getConversations)
router.get('/conversation', getSpecificConversation)
router.delete('/', deleteConversation)
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
