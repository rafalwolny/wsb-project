#!/usr/bin/env node
import { BackendStack } from "../lib/backend-stack";
import { App } from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";

const app = new App();

// read env vars 
const domain: string = process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME : "rafalwolny.pl";
const apiSubdomain: string = process.env.API_SUBDOMAIN ? process.env.API_SUBDOMAIN : "api.library";
const frontendSubdomain: string = process.env.FRONTEND_SUBDOMAIN ? process.env.FRONTEND_SUBDOMAIN : "library";

const accountId = "927305863820"
const domainConfig = { domain, apiSubdomain, frontendSubdomain };

const baseProps = {
  domainName: domainConfig.domain,
  hostedZoneId: "Z065110633NEVZ3DSQBU3",
}

const wsbBackendStack: BackendStack = new BackendStack(app, "wsb-backend-stack",{
  env: {
    account: accountId,
    region: "eu-west-1",
  },
  ...baseProps,
  // stack specific props
  apiSubdomain: domainConfig.apiSubdomain,
  backendBucketName: "wsb-project-backend",
  ec2InstanceType: "t2.micro",
  desiredCapacity: 1,
  maxCapacity: 2,
  minCapacity: 1,
});

const cdkFrontendStack: FrontendStack = new FrontendStack(app, "wsb-frontend-stack",{
  env:{
    account: accountId,
    region: "us-east-1"
  },
  ...baseProps,
  // stack specific props
  frontendSubdomain: domainConfig.frontendSubdomain,
  frontendBucketName: "wsb-frontend",
});
