const { validationResult } = require('express-validator')
const serviceHandler = require('../Config/services')
const {
  returnError,
  sendResponse,
  CREATED,
  NOT_ACCEPTABLE,
  SERVER_ERROR
} = require('../ResponseHandling')

const createTodo = async (req, res) => {
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

    const { user_id, adventure_id, public: publicField } = req.body

    req.logger.info(`marking adventure ${adventure_id} todo`)

    const { userTodo, adventureTodo } =
      await serviceHandler.userService.addAdventureTodo({
        userId: user_id,
        adventureId: adventure_id,
        isPublic: publicField
      })

    return sendResponse({
      req,
      res,
      data: {
        todo: {
          user_todo_field: userTodo,
          adventure_todo_field: adventureTodo
        }
      },
      status: CREATED
    })
  } catch (error) {
    return returnError({
      req,
      res,
      message: 'serverCreateTick',
      error,
      status: SERVER_ERROR
    })
  }
}

module.exports = {
  createTodo
}
