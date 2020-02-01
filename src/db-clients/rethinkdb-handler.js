const rethinkDb = require('rethinkdb')

class RethinkDBClient {
  constructor ({ host, port, db, user, password }) {
    this.host = host
    this.port = port
    this.db = db
    this.user = user
    this.password = password
    this.insert = this.insert.bind(this)
  }

  async init () {
    this.connection = await rethinkDb.connect({
      host: this.host,
      port: this.port,
      db: this.db
    })
  }

  async ensureTable ({ tableName }) {
    const currentTables = await rethinkDb.tableList().run(this.connection)
    if (currentTables.includes(tableName)) return
    const { tables_created: createdTable } = await rethinkDb.tableCreate(tableName).run(this.connection)
    if (!createdTable) throw Error(`unable to create table ${tableName}`)
  }

  async insert ({ tableName, data }) {
    const { inserted } = await rethinkDb.table(tableName).insert({
      ...data
    }).run(this.connection)
    if (!inserted) throw Error(`unable to insert ${JSON.stringify(data, 2)} into ${tableName}`)
  }

  onListenForUpdates ({ tableName, channel }, callback) {
    rethinkDb.table(tableName).filter(
      rethinkDb.row('channel').eq(channel)
    ).changes().run(this.connection, callback)
  }
}

module.exports = {
  RethinkDBClient
};

(async () => {
  if (require.main === module) {
    const client = new RethinkDBClient({ host: 'localhost', port: '28015', db: 'test' })
    await client.init()
    await client.ensureTable({ tableName: 'sample-table' })
    const sampleData = {
      user: 'mary',
      message: 'hello!',
      channel: 'session-1290',
      timestamp: 100000
    }
    await client.insert({ tableName: 'sample-table', data: sampleData })
    client.onListenForUpdates({ tableName: 'sample-table', channel: 'session-1290' }, (err, cursor) => {
      if (err) throw err
      cursor.each(console.log)
    })
    const sampleData2 = {
      user: 'mark',
      message: 'hello mary!',
      channel: 'session-1290',
      timestamp: 100002
    }
    const sampleData3 = {
      user: 'mary',
      message: 'hello mark!',
      channel: 'session-1290',
      timestamp: 100003
    }
    await client.insert({ tableName: 'sample-table', data: sampleData2 })
    await client.insert({ tableName: 'sample-table', data: sampleData3 })
  }
})()
