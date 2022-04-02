#!/usr/bin/env node
import { BackendStack } from "../lib/backend-stack";
import { App } from "aws-cdk-lib";

const app = new App();

const dockerTag: string = process.env.DOCKER_TAG ? process.env.DOCKER_TAG : "latest";

const wsbBackendStack: BackendStack = new BackendStack(app, "wsb-backend-stack",{
  env: {
    account: "927305863820",
    region: "eu-west-1",
  },
  backendBucketName: "wsb-project-backend-data",
});
