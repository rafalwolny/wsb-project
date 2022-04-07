import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { aws_autoscaling as autoscaling } from "aws-cdk-lib";
import { aws_certificatemanager as acm } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_elasticloadbalancingv2 as elbv2 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_s3_deployment as s3deploy } from "aws-cdk-lib"
import { aws_route53 as r53 } from "aws-cdk-lib";
import { aws_route53_targets as r53Targets } from "aws-cdk-lib";
import { Construct } from "constructs";

type BackendStackProps = StackProps & {
  domainName: string;
  hostedZoneId: string;
  apiSubdomain: string;
  backendBucketName: string;
  ec2InstanceType: string;
  desiredCapacity: number;
  maxCapacity: number;
  minCapacity: number;
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 2,
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: new ec2.InstanceType(props.ec2InstanceType),
      }),
    });

    const backendAutoScalingGroup = new autoscaling.AutoScalingGroup(this, "backendAutoScalingGroup", {
      vpc,
      instanceType: new ec2.InstanceType(props.ec2InstanceType),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      cooldown: Duration.seconds(15),
      desiredCapacity: props.desiredCapacity,
      maxCapacity: props.maxCapacity,
      minCapacity: props.minCapacity,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }),
    });

    // enable ssm connection
    backendAutoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // add read & write permissions to backend bucket for backend autoscaling group
    // s3.Bucket.fromBucketName(this, "backendBucket", props.backendBucketName)
    const backendBucket = new s3.Bucket(this, "backendBucket", {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: props.backendBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
    })
    backendBucket.grantReadWrite(backendAutoScalingGroup);

    const backendDeployment = new s3deploy.BucketDeployment(this, "backendDeployment", {
      sources: [s3deploy.Source.asset("./deployment/backend")],
      destinationBucket: backendBucket,
    });

    // base configuration for every instance
    const setupUserData = [
      "sudo runuser -l ec2-user",
      // install docker
      "sudo yum update -y",
      "sudo amazon-linux-extras install docker",
      "sudo service docker start",
      "sudo systemctl enable docker",
      // install docker-compose
      "sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose",
      "sudo chmod +x /usr/local/bin/docker-compose",
      // add permissions for ec2-user
      "sudo usermod -a -G docker ec2-user",
    ];

    // run backend app
    const runBackendUserData = [
      "sudo runuser -l ec2-user",
      `aws s3 cp s3://${props.backendBucketName}/wsb /srv/wsb --recursive`,
      "cd /srv/wsb",
      "docker-compose -f docker-compose-aws.yml up",
    ];

    // create autoscaling group only after deploying backend files to S3 bucket
    backendAutoScalingGroup.node.addDependency(backendDeployment)
    backendAutoScalingGroup.addUserData(...setupUserData, ...runBackendUserData);

    const backendLB = new elbv2.ApplicationLoadBalancer(this, 'backendLB', {
      loadBalancerName: "backendLB",
      vpc,
      internetFacing: true,
    });

    const backendListener = backendLB.addListener('backendListener', {
      port: 443,
      open: true,
    });

    const hostedZone = r53.HostedZone.fromHostedZoneAttributes(this, "hostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    const backendLBCertificate = new acm.Certificate(this, "backendLBCertificate", {
      domainName: `${props.apiSubdomain}.${props.domainName}`,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const backendLBRecordA = new r53.ARecord(this, "backendLBRecordA", {
      recordName: `${props.apiSubdomain}.${props.domainName}`,
      target: r53.RecordTarget.fromAlias(new r53Targets.LoadBalancerTarget(backendLB)),
      zone: hostedZone
    })

    backendListener.addCertificates("listenerCertificate", [
      elbv2.ListenerCertificate.fromCertificateManager(backendLBCertificate)
    ]);

    backendListener.addTargets("backendTarget", {
      deregistrationDelay: Duration.seconds(60),
      healthCheck: {
        path: "/search_all",
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: Duration.seconds(30),
      },
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [backendAutoScalingGroup],
    });

    backendAutoScalingGroup.connections.allowFrom(
      backendLB.connections,
      ec2.Port.tcp(8080),
      "Allow connections from LB to backend"
    );
  }
}
