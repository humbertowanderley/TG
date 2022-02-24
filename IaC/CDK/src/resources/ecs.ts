import { aws_autoscaling, aws_ec2, aws_ecs, Fn } from "aws-cdk-lib";
import { IAutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup} from "aws-cdk-lib/aws-ec2";
import { AsgCapacityProvider, Ec2Service, Ec2TaskDefinition, ICluster, IEc2TaskDefinition, ITaskDefinition } from "aws-cdk-lib/aws-ecs";
import { ManagedPolicy, Role } from "aws-cdk-lib/aws-iam";
import { ResourcesStack } from "../stacks/resourcesStack";


export class ECS {

    public static createECSCluster(resourcesStack: ResourcesStack, capacityProvider: AsgCapacityProvider): aws_ecs.Cluster {
        const ecsCluster = new aws_ecs.Cluster(resourcesStack, 'ECSCluster', {
            clusterName: 'ecs-cluster',
            vpc: resourcesStack.vpc
        });
        ecsCluster.addAsgCapacityProvider(capacityProvider);
        return ecsCluster;
    }

    public static createECSEc2TaskDefinition(resourcesStack: ResourcesStack): Ec2TaskDefinition {
        const ec2TaskDefinition = new aws_ecs.Ec2TaskDefinition(resourcesStack, 'TaskDefinition');
        ec2TaskDefinition.addContainer('DefaultContainer', {
            containerName: 'webApp',
            image: aws_ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 256,
            portMappings: [{ containerPort: 80 }]
        })
        return ec2TaskDefinition
    }

    public static createCapacityProvider(resourcesStack: ResourcesStack, autoScalingGroup: IAutoScalingGroup): AsgCapacityProvider {
        const capacityProvider = new aws_ecs.AsgCapacityProvider(resourcesStack, 'AsgCapacityProvider', {
            autoScalingGroup: autoScalingGroup,
            enableManagedTerminationProtection: false
        });
        return capacityProvider;
    }

    public static createAutoScalingGroup(resourcesStack: ResourcesStack) {
        const autoScalingGroup = new aws_autoscaling.AutoScalingGroup(resourcesStack, 'ASG', {
            autoScalingGroupName: 'asg',
            vpc: resourcesStack.vpc,
            instanceType: new aws_ec2.InstanceType('t2.micro'),
            machineImage: aws_ecs.EcsOptimizedImage.amazonLinux2(),
            vpcSubnets: resourcesStack.vpc.selectSubnets({
                subnetType: aws_ec2.SubnetType.PUBLIC
            }),
            newInstancesProtectedFromScaleIn: false,
            minCapacity: 1,
            maxCapacity: 4,
            securityGroup: SecurityGroup.fromSecurityGroupId(resourcesStack, 'Ec2SGId', Fn.importValue('ec2InstancesSecurityGroup')),
        });

        autoScalingGroup.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        return autoScalingGroup;
    }

    public static createECSService(resourcesStack: ResourcesStack, ecsCluster: ICluster, taskDefinition: Ec2TaskDefinition): Ec2Service {
        const ecsService = new aws_ecs.Ec2Service(resourcesStack, 'ECSService', {
            cluster: ecsCluster,
            taskDefinition: taskDefinition,
            desiredCount: 1,
        });
        this.configureECSAutoScaling(ecsService);
        return ecsService;
    }

    private static configureECSAutoScaling(ecsSertice: Ec2Service) {
        const taskCount = ecsSertice.autoScaleTaskCount({
            minCapacity: 1,
            maxCapacity: 10,
        });

        taskCount.scaleOnCpuUtilization('scaleCPUUtilization', {
            targetUtilizationPercent: 80
        });

        taskCount.scaleOnMemoryUtilization('scaleMemmoryUtilization', {
            targetUtilizationPercent: 80
        });
    }
}