import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_s3_deployment as s3deploy } from "aws-cdk-lib"
import { Construct } from "constructs";

type FrontendStackProps = StackProps & {
  frontendBucketName: string;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const frontendBucket = s3.Bucket.fromBucketName(this, "frontendBucket", props.frontendBucketName);

    const frontendDeployment = new s3deploy.BucketDeployment(this, "frontendDeployment", {
      sources: [s3deploy.Source.asset("../frontend/deployment")],
      destinationBucket: frontendBucket,
    });
  }
}