const https = require('https')
const fs = require('fs')
const path = require('path')

const logger = require('./Config/logger')
const app = require('./app')

const PORT = process.env.PORT || 5000

// created by following https://www.youtube.com/watch?v=USrMdBF0zcg

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
  },
  app
)

// const wss = new WebSocket.Server({ server })

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     console.log({ message })
//     ws.send(`Echoing ${message}`)
//   })
// })

server.listen(PORT, () =>
  logger.info(`Sunday Peak API/Websocket listening on port ${PORT}`)
)
