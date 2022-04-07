#!/bin/bash

### STEP 1 - read config files
export $(grep -v '^#' .config | xargs)
export $(grep -v '^#' .env | xargs)


### STEP 2 - copy files for upload to S3
# copy
mkdir -p $CDK_DEPLOYMENT_DIR/frontend $CDK_DEPLOYMENT_DIR/backend/wsb
cp -r $FRONTEND_DIR/*         $CDK_DEPLOYMENT_DIR/frontend/.
cp docker-compose-aws.yml     $CDK_DEPLOYMENT_DIR/backend/wsb/.
cp $API_CONF_DIR/default.conf $CDK_DEPLOYMENT_DIR/backend/wsb/.

# adjust
sed -i "s;http://localhost:3000;https://$DOMAIN_NAME;g" $CDK_DEPLOYMENT_DIR/frontend/index.js
sed -i "s/TAG/$DOCKER_TAG/g" $CDK_DEPLOYMENT_DIR/backend/wsb/docker-compose-aws.yml


### STEP 3 - execute "cdk deploy"
echo "Deploying CloudFormation templates..."
cd cdk
cdk deploy wsb-frontend-stack wsb-backend-stack
