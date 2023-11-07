const { Router } = require('express')
const { addConversation, getConversations } = require('../../Handlers/Messages')

const router = Router()

router.post('/', addConversation)
router.get('/', getConversations)

module.exports = router
