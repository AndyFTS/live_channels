const r = require('rethinkdb')
const express = require('express')
const jwt = require('jwt-simple')
const app = express()

const { config } = require('./config/config.js')
const { SocketHandler } = require('./socket-clients/socket-handler.js')
const { RethinkDBClient } = require('./db-clients/rethinkdb-handler.js')

const {
  APP_SECRET,
  DBHOST,
  DBPORT,
  PORT,
  WSPORT
} = config

const socketHandler = new SocketHandler()
const rethinkDbHandler = new RethinkDBClient({ host: DBHOST, port: DBPORT, db: 'test' });

(async () => {
  await rethinkDbHandler.init()
})()

socketHandler.onHandleIncomingClient({
  onConnect: async ({ ws, request, client, channel, table, id }) => {
    rethinkDbHandler.onListenForUpdates({
      tableName: table,
      channel
    }, (err, cursor) => {
      if (err) throw err
      cursor.each((err, row) => {
        if (err) throw err
        const { new_val } = row;
        ws.send(new_val.message)
      })
    })
  },
  onInsert: rethinkDbHandler.insert
});
app.get('/subscribe/:channel/:id', async (request, response) => {
  const { params } = request
  const { channel, id } = params
  const token = jwt.encode({
    channel,
    id,
    iss: 'YOURMOM',
    table: channel
  }, APP_SECRET)
  await rethinkDbHandler.ensureTable({ tableName: channel })
  const reply = {
    domain: `ws://localhost:${WSPORT}`,
    channel,
    id,
    token
  }
  response.send(JSON.stringify(reply, 2))
})

app.listen(PORT)
socketHandler.listen(WSPORT)
console.log(`wss is running live on port ${WSPORT}`)
console.log(`app is running live on port ${PORT}`)
