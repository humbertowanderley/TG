import { aws_autoscaling, aws_ec2, aws_ecs } from "aws-cdk-lib";
import { IVpc} from "aws-cdk-lib/aws-ec2";
import { Ec2Service, Ec2TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { ResourcesStack } from "../stacks/resourcesStack";


export class ECS {

    private static createECSCluster(resourcesStack: ResourcesStack, vpc: IVpc): aws_ecs.Cluster {
        const ecsCluster = new aws_ecs.Cluster(resourcesStack, 'ECSCluster', {
            clusterName: 'ecs-cluster',
            vpc: vpc
        });
        return ecsCluster;
    }

    private static createCapacityProvider(resourcesStack: ResourcesStack, vpc: IVpc): aws_ecs.AsgCapacityProvider {
        const autoScalingGroup = new aws_autoscaling.AutoScalingGroup(resourcesStack, 'ASG', {
            autoScalingGroupName: 'asg',
            vpc,
            instanceType: new aws_ec2.InstanceType('t2.micro'),
            machineImage: aws_ecs.EcsOptimizedImage.amazonLinux2(),
            vpcSubnets: vpc.selectSubnets({
                subnetType: aws_ec2.SubnetType.PUBLIC
            }),
            minCapacity: 1,
            maxCapacity: 2
        });

        const capacityProvider = new aws_ecs.AsgCapacityProvider(resourcesStack, 'AsgCapacityProvider', {
            autoScalingGroup,
            enableManagedScaling: true
        });
        return capacityProvider;
    }

    private static createECSEc2TaskDefinition(resourcesStack: ResourcesStack): Ec2TaskDefinition {
        const ec2TaskDefinition = new aws_ecs.Ec2TaskDefinition(resourcesStack, 'TaskDefinition');
        ec2TaskDefinition.addContainer('DefaultContainer', {
            image: aws_ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 256,
            portMappings: [{ hostPort: 80, containerPort: 80 }]
        })
        return ec2TaskDefinition
    }

    public static createECSService(resourcesStack: ResourcesStack, vpc: IVpc): Ec2Service {
        const ecsCluster = this.createECSCluster(resourcesStack, vpc);
        const ec2TaskDefinition = this.createECSEc2TaskDefinition(resourcesStack);
        const capacityProvider = this.createCapacityProvider(resourcesStack, vpc);

        ecsCluster.addAsgCapacityProvider(capacityProvider);

        const service = new aws_ecs.Ec2Service(resourcesStack, 'ECSService', {
            cluster: ecsCluster,
            taskDefinition: ec2TaskDefinition
        });
        return service;
    }
}