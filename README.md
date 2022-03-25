Library app
-----------

Simple library app for WSB project. 

### Components

* node.js backend server
* mysql database

### Start app

1. Clone the repository
2. Edit `.env` file located in the root directory (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` are mandatory)
3. In the root directory of the project run:
```
docker-compose up
```

That command will start the backend server and mysql database running inside containers.

The app will be running on http://localhost:3000
