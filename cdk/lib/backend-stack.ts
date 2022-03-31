import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { aws_autoscaling as autoscaling } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
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
      machineImage: new ec2.AmazonLinuxImage(),
      cooldown: Duration.seconds(30),
      desiredCapacity: 1,
      maxCapacity: 2,
      minCapacity: 1,
    });
  }
}