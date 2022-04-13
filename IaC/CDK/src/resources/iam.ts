import { CfnParameter, Fn } from "@aws-cdk/core";
import { AutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port } from "@aws-cdk/aws-ec2";
import { EcsOptimizedImage } from "@aws-cdk/aws-ecs";
import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";

export class IAM {

    public static createInstanceRole(id:string, resourcesStack: ResourcesStack) {

        return new Role(resourcesStack, `${id}instanceRole`, {
            assumedBy: new CompositePrincipal( 
                new ServicePrincipal('ecs-tasks.amazonaws.com'),
                new ServicePrincipal('ec2.amazonaws.com'),
                new ServicePrincipal('ssm.amazonaws.com')
            ),
            managedPolicies: [
                ManagedPolicy.fromManagedPolicyArn(resourcesStack, `${id}AmazonECSTaskExecutionRolePolicy`, 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'),
                ManagedPolicy.fromManagedPolicyArn(resourcesStack, `${id}AmazonEC2ContainerServiceforEC2Role`, 'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
            ]
        });

    }

    public static createInstanceSecurityGroup(resourcesStack: ResourcesStack) {
        const instanceSG = new SecurityGroup(resourcesStack, 'instanceSecurityGroup', {
            vpc: resourcesStack.vpc,
            securityGroupName: 'instanceSG',
            allowAllOutbound: true,
        });
        instanceSG.addIngressRule(Peer.ipv4('10.0.0.0/16'),Port.tcpRange(1024, 65535));
        return instanceSG;
    }
}
