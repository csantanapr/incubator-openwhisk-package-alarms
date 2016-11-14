start fake whisk
```
node tests/debugserver.js
```

start master provider
```
PORT=3002 slave=http://localhost:3001 node provider/app.js
```

start slave provider
```
slaverole=true PORT=3001 master=http://localhost:3002 node provider/app.js
```

create a new trigger
```
node tests/createtrigger.js CREATE trigger18 "* * * * *"
```