import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { aws_autoscaling as autoscaling } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { Construct } from "constructs";

type BackendStackProps = StackProps & {
  // props
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
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT }),
    });

    // enable ssm connection
    backendAutoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    const frontendAutoScalingGroup= new autoscaling.AutoScalingGroup(this, "frontendAutoScalingGroup", {
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
    frontendAutoScalingGroup.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // add read & write permissions to frontend bucket for frontend autoscaling group
    const frontendBucket = s3.Bucket.fromBucketArn(this, "frontendBucket", "arn:aws:s3:::wsb-project-frontend-data")
    frontendBucket.grantReadWrite(frontendAutoScalingGroup);

    // base configuration for every instance
    const baseUserData = [
      "sudo runuser -l ssm-user",
      // install docker
      "sudo yum update -y",
      "sudo amazon-linux-extras install docker",
      "sudo service docker start",
      "sudo systemctl enable docker",
      "sudo usermod -a -G docker ssm-user",
    ];

    backendAutoScalingGroup.addUserData(...baseUserData);
    frontendAutoScalingGroup.addUserData(...baseUserData);

    backendAutoScalingGroup.connections.allowFrom(
      frontendAutoScalingGroup.connections,
      ec2.Port.tcp(3000),
      "Allow connections from frontend to backend"
    );

    frontendAutoScalingGroup.connections.allowFromAnyIpv4(
      ec2.Port.tcp(8080),
      "Allow connections from internet to frontend"
    );
  }
}