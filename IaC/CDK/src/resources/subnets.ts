import { CfnOutput, CfnParameter, Fn } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port, PrivateSubnet, ISubnet, NetworkAcl } from "aws-cdk-lib/aws-ec2";
import { EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";

export class Subnets {
    public static databaseSubnet1: ISubnet;
    public static databaseSubnet2: ISubnet;

    public static createIsolatedSubnet(networkStack: NetworkStack) {
        this.databaseSubnet1 = new PrivateSubnet(networkStack, 'DataBaseSubnet1', {
            vpcId: networkStack.vpc.vpcId,
            availabilityZone: 'us-east-1a',
            cidrBlock: '10.0.10.0/24'
        });

        this.databaseSubnet2 = new PrivateSubnet(networkStack, 'DataBaseSubnet2', {
            vpcId: networkStack.vpc.vpcId,
            availabilityZone: 'us-east-1b',
            cidrBlock: '10.0.11.0/24'
        });

    }

}
