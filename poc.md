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
node provider/app.js
```