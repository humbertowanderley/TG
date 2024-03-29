import { CfnParameter, Fn, Stack } from "aws-cdk-lib";
import { AutoScalingGroup, IAutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet } from "aws-cdk-lib/aws-ec2";
import { EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";
import { IAM } from "./iam";

export class ASG {
    public static autoScalingGroup: IAutoScalingGroup;

    public static createAutoScalingGroup(resourcesStack: ResourcesStack): void {
        this.autoScalingGroup = new AutoScalingGroup(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}ASG`, {
            autoScalingGroupName: `${StackEnviroments.RESOURCES_PREFIX}ASG`,
            vpc: resourcesStack.vpc,
            instanceType: new InstanceType(AutoScalingGroupEnviroments.ASG_INSTANCE_TYPE),
            machineImage: EcsOptimizedImage.amazonLinux2(),
            vpcSubnets: resourcesStack.vpc.selectSubnets({
                subnets: [
                    Subnet.fromSubnetAttributes(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}asgSubnet1`, {
                        subnetId: Fn.importValue('Ec2PrivateSubnet'),
                        availabilityZone: 'us-east-1a'
                    })
                ]
            }),
            newInstancesProtectedFromScaleIn: false,
            desiredCapacity: 1,
            minCapacity: AutoScalingGroupEnviroments.ASG_MIN_CAPACITY,
            maxCapacity: AutoScalingGroupEnviroments.ASG_MAX_CAPACITY,
            role: IAM.instanceRole,
            securityGroup: IAM.createInstanceSecurityGroup(resourcesStack)
        });
    }
}