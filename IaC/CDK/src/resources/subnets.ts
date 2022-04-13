import { CfnOutput, CfnParameter, Fn } from "@aws-cdk/core";
import { AutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port, PrivateSubnet, ISubnet, NetworkAcl } from "@aws-cdk/aws-ec2";
import { EcsOptimizedImage } from "@aws-cdk/aws-ecs";
import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";

export class Subnets {
    private static isolatedSubnet: ISubnet;

    public static createIsolatedSubnet(networkStack: NetworkStack) {
        this.isolatedSubnet = new PrivateSubnet(networkStack, 'DatabaseIsolatedSubnet2', {
            vpcId: networkStack.vpc.vpcId,
            availabilityZone: 'us-east-1b',
            cidrBlock: '10.0.8.0/24'
        });
    }

    public static createOutputs(networkStack: NetworkStack) {
        new CfnOutput(networkStack, 'isolatedSubnet2IdOutput', {
            exportName: 'IsolatedSubnet2',
            value: this.isolatedSubnet.subnetId
        });
    }
}
