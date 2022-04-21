#IaC app & Library app
-----------

The project consists of two components:
1. Infrastructure as Code application based on AWS CDK (main)
2. Simple node.js app called Library App

## Technologies used

**IaC app:** CloudFormation with CDK framework written in TypeScript

**Library app:** 

* Frontend: JavaScript, CSS, HTML
* Backend: Node.js, Nginx, Docker, Docker Compose 
* Database: MySQL


Library app
-----------

## Components

1. Frontend:
* Static `.js`, `.css`, `.html` files under `frontend/` directory
2. Backend:
* Reverse proxy built on Nginx
* Node.js backend app
3. MySQL database

## Start app locally

1. Clone the repository
2. Edit `.env` file located in the root directory (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` are mandatory)
3. In the root directory of the project run:
```
docker-compose up
```

That command will start nginx, backend and database containers.
The backend app will be running on http://localhost:8080


IaC app
-----------

## Architecture

The diagram which describes the infrastructure in detail is located in `diagram/` directory.
The `rafalwolny.pl` domain is provided by OVH registrar and configuration management is delegated to AWS Route53 hosted zone

## Deploy app on AWS

### Requirements

* AWS account
* User with active access keys and appropriate permissions (admin access recommended)
* AWS CLI installed and configured on the workstation
* AWS CDK installed and configured on the workstation
* cloned repository

### Deployment

1. (optional) Check what changes are going to be done on AWS using this command in /cdk directory:
```
cdk diff
```
2. In the project's root directory run:
```
./deploy
```
