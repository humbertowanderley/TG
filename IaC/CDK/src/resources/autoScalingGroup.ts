import { CfnParameter, Fn, Stack } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet } from "aws-cdk-lib/aws-ec2";
import { EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";
import { IAM } from "./iam";

export class ASG {

    public static createAutoScalingGroup(resourcesStack: ResourcesStack) {
        const autoScalingGroup = new AutoScalingGroup(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}ASG`, {
            autoScalingGroupName: `${StackEnviroments.RESOURCES_PREFIX}ASG`,
            vpc: resourcesStack.vpc,
            instanceType: new InstanceType(AutoScalingGroupEnviroments.ASG_INSTANCE_TYPE),
            machineImage: EcsOptimizedImage.amazonLinux2(),
            vpcSubnets: resourcesStack.vpc.selectSubnets({
                subnets: [
                    Subnet.fromSubnetAttributes(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}asgSubnet1`, {
                        subnetId: Fn.importValue('PublicSubnet1'),
                        availabilityZone: Stack.of(resourcesStack).availabilityZones[0]
                    }),
                    Subnet.fromSubnetAttributes(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}asgSubnet2`, {
                        subnetId: Fn.importValue('PublicSubnet2'),
                        availabilityZone: Stack.of(resourcesStack).availabilityZones[1]
                    })
                ]
            }),
            newInstancesProtectedFromScaleIn: false,
            desiredCapacity: 1,
            minCapacity: AutoScalingGroupEnviroments.ASG_MIN_CAPACITY,
            maxCapacity: AutoScalingGroupEnviroments.ASG_MAX_CAPACITY,
            role: IAM.instanceRole,
            securityGroup: IAM.createInstanceSecurityGroup(resourcesStack)
            // associatePublicIpAddress: false
        });

        return autoScalingGroup;
    }

    // TODO: add ecs execution container service and execution for ECS on EC2 Role
}