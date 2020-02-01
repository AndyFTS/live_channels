const http = require('http')
const url = require('url')
const { parse } = require('query-string')
const jwt = require('jwt-simple')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const { config: { APP_SECRET } } = require('../config/config.js')

class SocketHandler {
  constructor () {
    this.server = http.createServer()
    this.wss = new WebSocketServer({ noServer: true })
    this.server.on('upgrade', (request, socket, head) => {
      this.authenticate(request, (err, client, token) => {
        if (err || !client) {
          socket.destroy()
          return
        }
        const {
          table,
          id,
          channel
        } = token;

        this.wss.handleUpgrade(request, socket, head, (ws) => {
          ws.id = id
          ws.channel = channel
          ws.table = table
          this.wss.emit('connection', ws, request, client, id, channel, table)
        })
      })
    })
  }

  onHandleIncomingClient ({ onConnect, onInsert }) {
    this.wss.on('connection', async (ws, request, client, id, channel, table) => {
      ws.on('message', async (data) => {
        console.log({ channel, id, table })

        const tableData = {
          channel,
          userId: id,
          message: data
        }
        console.log(tableData)

        await onInsert({
          tableName: table,
          data: tableData
        })
      })
      onConnect({ ws, request, client, id, channel, table })
    })
  }

  listen (port) {
    this.server.listen(port)
  }

  authenticate (request, callback) {
    try {
      const { url: urlParams, client } = request
      const { query } = url.parse(urlParams)
      const { token } = parse(query)
      const decodedToken = jwt.decode(token, APP_SECRET)
      callback(null, client, decodedToken)
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = {
  SocketHandler
}
