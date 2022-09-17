import { IAutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { AsgCapacityProvider, Ec2Service, Ec2TaskDefinition, ICluster, ContainerImage, Cluster } from "aws-cdk-lib/aws-ecs";
import { ResourcesStack } from "../stacks/resources-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Role } from "aws-cdk-lib/aws-iam";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import { EcsEnvironments } from "../utils/ecsEnvironments";
import { IAM } from "./iam";
import { RDS } from "./rds";
import { Volume } from "aws-cdk-lib/aws-ec2";

export class ECS {

    public static createECSCluster(resourcesStack: ResourcesStack, capacityProvider: AsgCapacityProvider): Cluster {
        const ecsCluster = new Cluster(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}ecsCluster`, {
            clusterName: `${StackEnviroments.RESOURCES_PREFIX}ecsCluster`,
            vpc: resourcesStack.vpc
        });
        ecsCluster.addAsgCapacityProvider(capacityProvider);
        return ecsCluster;
    }

    public static createEcsTaskDefinition(resourcesStack: ResourcesStack, containerName: string, port: number): Ec2TaskDefinition {

        // TODO: Import Ec2 Role from environment stack
        const ecsTaskDefinition = new Ec2TaskDefinition(resourcesStack, `${containerName}TaskDefinition`, {
            taskRole: IAM.instanceRole
        });
        ecsTaskDefinition.addContainer(containerName, {
            containerName: containerName,
            image: ContainerImage.fromRegistry('grafana/grafana:9.1.5-ubuntu'),
            memoryLimitMiB: EcsEnvironments.ECS_TASK_CONTAINERS_MEMORY_LIMIT,
            portMappings: [{ containerPort: EcsEnvironments.ECS_GF_PORT }],
            environment: {
                ['GF_AUTH_ANONYMOUS_ENABLED']: 'false',
                ['GF_DATABASE_TYPE']: 'postgres',
                ['GF_DATABASE_HOST']: RDS.dbInstance.instanceEndpoint.socketAddress,
                ['GF_DATABASE_NAME']: 'grafana',
                ['GF_DATABASE_USER']: 'dbuser',
                ['GF_DATABASE_PASSWORD']: 'T3st4nd423'
            },

        });
        return ecsTaskDefinition
    }

    public static createCapacityProvider(resourcesStack: ResourcesStack, autoScalingGroup: IAutoScalingGroup): AsgCapacityProvider {
        const capacityProvider = new AsgCapacityProvider(resourcesStack, 'AsgCapacityProvider', {
            capacityProviderName: `${StackEnviroments.RESOURCES_PREFIX}ecsCapacityProvider`,
            autoScalingGroup: autoScalingGroup,
            enableManagedTerminationProtection: false,
            enableManagedScaling: true,
            targetCapacityPercent: EcsEnvironments.ECS_TARGET_CAPACITY_PERCENT,
            canContainersAccessInstanceRole: true
        });
        return capacityProvider;
    }

    public static createECSServices(resourcesStack: ResourcesStack, ecsCluster: ICluster): Ec2Service[] {
        const grafanaService = new Ec2Service(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}grafanaService`, {
            cluster: ecsCluster,
            taskDefinition: this.createEcsTaskDefinition(resourcesStack, 'grafana', EcsEnvironments.ECS_GF_PORT),
            desiredCount: 1
        });
        this.configureECSAutoScaling('grafana', grafanaService);
        return [grafanaService];
    }

    private static configureECSAutoScaling(id: string, ecsService: Ec2Service) {
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
