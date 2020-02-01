const config = {
  APP_SECRET: process.env.APP_SECRET || 'n0@m*Ch0M$ki',
  PORT: process.env.PORT || 8080,
  WSPORT: process.env.WSPORT || 8081,
  DBHOST: process.env.DBHOST || 'localhost',
  DBPORT: process.env.DBPORT || 28015,
  DBUSER: process.env.DBUSER || '',
  DBPASSWORD: process.env.DBPASSWORD || ''
}

module.exports = {
  config
}
