#!/usr/bin/env node
import { BackendStack } from "../lib/backend-stack";
import { Environment } from "aws-cdk-lib";
import { App } from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";

const app = new App();

const dockerTag: string = process.env.DOCKER_TAG ? process.env.DOCKER_TAG : "latest";

const env: Environment = {
  account: "927305863820",
  region: "eu-west-1",
}

const wsbBackendStack: BackendStack = new BackendStack(app, "wsb-backend-stack",{
  env,
  backendBucketName: "wsb-project-backend-data",
});

const wsbFrontendStack: FrontendStack = new FrontendStack(app, "wsb-frontend-stack", { 
  env,
  frontendBucketName: "rafal-wolny-wsb-project",
});
