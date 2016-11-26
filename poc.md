start fake whisk
```
node tests/debugserver.js
```

create trigger db
```
node tests/setupdb.js
```

create trigger
```
node tests/testalarm.js
```

list triggers
```
node tests/listdocs.js
```

delete triiger
```
node tests/testalarm.js DELETE $triggerId
```

start master provider
```
ROLE=master_slave PORT=3002 node provider/app.js
```

activate master provider
```
curl http://localhost:3002/active?state=true
```

start slave provider
```
ROLE=slave PORT=3003 node provider/app.js
```

start monitor
```
MASTER=http://localhost:3002 SLAVE http://localhost:3003 node provider/monitor.js
```

