import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { aws_certificatemanager as acm } from "aws-cdk-lib";
import { aws_cloudfront as cloudfront } from "aws-cdk-lib";
import { aws_cloudfront_origins as origins } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_s3_deployment as s3deploy } from "aws-cdk-lib";
import { aws_route53 as r53 } from "aws-cdk-lib";
import { aws_route53_targets as r53Targets } from "aws-cdk-lib";
import { Construct } from "constructs";

type FrontendStackProps = StackProps & {
  domainName: string;
  hostedZoneId: string;
  frontendSubdomain: string;
  frontendBucketName: string;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const frontendBucket = new s3.Bucket(this, "frontendBucket", {
      autoDeleteObjects: true,
      bucketName: props.frontendBucketName,
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });

    const hostedZone = r53.HostedZone.fromHostedZoneAttributes(this, "hostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    const frontendLBCertificate = new acm.Certificate(this, "frontendLBCertificate", {
      domainName: `${props.frontendSubdomain}.${props.domainName}`,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const frontendDist = new cloudfront.Distribution(this, 'frontendDist', {
      certificate: frontendLBCertificate,
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [`${props.frontendSubdomain}.${props.domainName}`]
    });

    const frontendDistRecordA = new r53.ARecord(this, "frontendDistRecordA", {
      recordName: `${props.frontendSubdomain}.${props.domainName}`,
      target: r53.RecordTarget.fromAlias(new r53Targets.CloudFrontTarget(frontendDist)),
      zone: hostedZone,
    });

    const frontendDeployment = new s3deploy.BucketDeployment(this, "frontendDeployment", {
      sources: [s3deploy.Source.asset("./deployment/frontend")],
      destinationBucket: frontendBucket,
      distribution: frontendDist,
      distributionPaths: ["/*"],
    });
  }
}