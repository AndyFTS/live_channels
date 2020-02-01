# Live Channel Client

## Testing Locally
Assumes you have node

  install wscat
```
 $ npm install -g wscat
```
  run the rethinkdb image 
```
 $ docker run -ti -p 28015:28015 rethinkdb
```
run the app 
```
 $ npm run start
```
  may need to give node permissions to open addr's
```
 $ sudo npm run start
```
open a channel
```
 $ curl localhost:8080/subscribe/chanski/3001
```
  server should respond with `ws opened on channel ws://localhost:3001/chanski/3001`
  connect to websocket with single client or multiple clients
```
 $ wscat -c ws://localhost:229/channel/229
```
