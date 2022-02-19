import { aws_ec2, aws_ecs, Fn, Stack } from "aws-cdk-lib";
import { EcsApplication } from "aws-cdk-lib/aws-codedeploy";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Ec2TaskDefinition, ICluster, IEc2TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { EcsEc2LaunchTarget } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { ResourcesStack } from "../stacks/resourcesStack";


export class ECS {

    private static createECSCluster(resourcesStack: ResourcesStack): ICluster {
        return new aws_ecs.Cluster(resourcesStack, 'ECSCluster', {
            clusterName: 'ecs-cluster',
            vpc: Vpc.fromVpcAttributes(resourcesStack, 'VPC', {
                vpcId: Fn.importValue('VPC'),
                availabilityZones: resourcesStack.availabilityZones,
                publicSubnetIds: [Fn.importValue('PublicSubnet1'), Fn.importValue('PublicSubnet2')]
            }),
            capacity: {
                instanceType: new aws_ec2.InstanceType('t2.micro'),
                maxCapacity: 2
            }
        })
    }

    private static createECSEc2TaskDefinition(resourcesStack: ResourcesStack): Ec2TaskDefinition {
        const ec2TaskDefinition = new aws_ecs.Ec2TaskDefinition(resourcesStack, 'TaskDefinition');
        ec2TaskDefinition.addContainer('DefaultContainer', {
            image: aws_ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 256,
            portMappings: [{hostPort: 80, containerPort: 80}]
        })

        return ec2TaskDefinition
    }

    public static createECSService(resourcesStack: ResourcesStack) {
        const ecsCluster = this.createECSCluster(resourcesStack);
        const ec2TaskDefinition = this.createECSEc2TaskDefinition(resourcesStack);
        new aws_ecs.Ec2Service(resourcesStack, 'ECSService', {
            cluster: ecsCluster,
            taskDefinition: ec2TaskDefinition
        });
    }
}