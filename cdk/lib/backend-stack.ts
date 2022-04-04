import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { aws_autoscaling as autoscaling } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_s3_deployment as s3deployment } from "aws-cdk-lib"
import { Construct } from "constructs";

type BackendStackProps = StackProps & {
  backendBucketName: string;
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 1,
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: new ec2.InstanceType("t2.micro"),
      }),
    });

    const backendAutoScalingGroup = new autoscaling.AutoScalingGroup(this, "backendAutoScalingGroup", {
      vpc,
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      cooldown: Duration.seconds(30),
      desiredCapacity: 1,
      maxCapacity: 2,
      minCapacity: 1,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }),
    });

    // enable ssm connection
    backendAutoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // add read & write permissions to backend bucket for backend autoscaling group
    const backendBucket = s3.Bucket.fromBucketName(this, "backendBucket", props.backendBucketName)
    backendBucket.grantReadWrite(backendAutoScalingGroup);

    const backendDeployment = new s3deployment.BucketDeployment(
      this,
      "backendDeployment",
      {
          sources: [s3deployment.Source.asset("../backend/deployment")],
          destinationBucket: backendBucket,
      }
    );

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
    ]

    // create autoscaling group only after deploying backend files to S3 bucket
    backendAutoScalingGroup.node.addDependency(backendDeployment)
    backendAutoScalingGroup.addUserData(...setupUserData, ...runBackendUserData);

    // CREATE LB AND UNCOMMENT
    // backendAutoScalingGroup.connections.allowFrom(
    //   backendLoadBalancer.connections,
    //   ec2.Port.tcp(80),
    //   "Allow connections from LB to backend"
    // );

    backendAutoScalingGroup.connections.allowFromAnyIpv4(
      ec2.Port.tcp(80),
      "Allow connections from internet to frontend"
    );
  }
}
