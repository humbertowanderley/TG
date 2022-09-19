import { IAutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { AsgCapacityProvider, Ec2Service, Ec2TaskDefinition, ICluster, ContainerImage, Cluster, IEc2TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { ResourcesStack } from "../stacks/resources-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Role } from "aws-cdk-lib/aws-iam";
import { IRepository, Repository } from "aws-cdk-lib/aws-ecr";
import { EcsEnvironments } from "../utils/ecsEnvironments";
import { IAM } from "./iam";
import { RDS } from "./rds";
import { Volume } from "aws-cdk-lib/aws-ec2";
import { Fn } from "aws-cdk-lib";

export class ECS {

    public static taskDefinition: Ec2TaskDefinition;
    public static grafanaService: Ec2Service;
    public static capacityProvider: AsgCapacityProvider;
    public static ecsCluster: Cluster;

    public static createECSCluster(resourcesStack: ResourcesStack, capacityProvider: AsgCapacityProvider): void {
        this.ecsCluster = new Cluster(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}ecsCluster`, {
            clusterName: `${StackEnviroments.RESOURCES_PREFIX}ecsCluster`,
            vpc: resourcesStack.vpc
        });
        this.ecsCluster.addAsgCapacityProvider(capacityProvider);
    }

    public static createEcsTaskDefinition(resourcesStack: ResourcesStack, containerName: string, port: number): void {

        this.taskDefinition = new Ec2TaskDefinition(resourcesStack, `${containerName}TaskDefinition`, {
            taskRole: IAM.instanceRole
        });
        this.taskDefinition.addContainer(containerName, {
            containerName: containerName,
            image: ContainerImage.fromRegistry('grafana/grafana:9.1.5'),
            memoryLimitMiB: EcsEnvironments.ECS_TASK_CONTAINERS_MEMORY_LIMIT,
            portMappings: [{ containerPort: EcsEnvironments.ECS_GF_PORT }],
            environment: {
                ['GF_AUTH_ANONYMOUS_ENABLED']: 'false',
                ['GF_DATABASE_TYPE']: 'postgres',
                ['GF_DATABASE_HOST']: Fn.importValue('DatabaseEndpoint'),
                ['GF_DATABASE_NAME']: 'grafana',
                ['GF_DATABASE_USER']: 'dbuser',
                ['GF_DATABASE_PASSWORD']: 'T3st4nd423'
            },

        });
    }

    public static createCapacityProvider(resourcesStack: ResourcesStack, autoScalingGroup: IAutoScalingGroup): void {
        this.capacityProvider = new AsgCapacityProvider(resourcesStack, 'AsgCapacityProvider', {
            capacityProviderName: `${StackEnviroments.RESOURCES_PREFIX}ecsCapacityProvider`,
            autoScalingGroup: autoScalingGroup,
            enableManagedTerminationProtection: false,
            enableManagedScaling: true,
            targetCapacityPercent: EcsEnvironments.ECS_TARGET_CAPACITY_PERCENT,
            canContainersAccessInstanceRole: true
        });
    }

    public static createECSServices(resourcesStack: ResourcesStack, ecsCluster: ICluster): void {
        this.createEcsTaskDefinition(resourcesStack, 'grafana', EcsEnvironments.ECS_GF_PORT);
    
        this.grafanaService = new Ec2Service(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}grafanaService`, {
            cluster: ecsCluster,
            taskDefinition: this.taskDefinition,
            desiredCount: 1
        });
        this.configureECSAutoScaling('grafana', this.grafanaService);
    }

    private static configureECSAutoScaling(id: string, ecsService: Ec2Service): void {
        const taskCount = ecsService.autoScaleTaskCount({
            minCapacity: EcsEnvironments.ECS_MIN_CAPACITY,
            maxCapacity: EcsEnvironments.ECS_MAX_CAPACITY,
        });

        taskCount.scaleOnCpuUtilization(`${id}ScaleCPUUtilization`, {
            targetUtilizationPercent: EcsEnvironments.ECS_CPU_UTILIZATION_PERCENT
        });

        taskCount.scaleOnMemoryUtilization(`${id}ScaleMemoryUtilization`, {
            targetUtilizationPercent: EcsEnvironments.ECS_MEMORY_UTILIZATION_PERCENT
        });
    }
}
