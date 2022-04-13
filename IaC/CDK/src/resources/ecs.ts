import { IAutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import { AsgCapacityProvider, Ec2Service, Ec2TaskDefinition, ICluster, ContainerImage, Cluster } from "@aws-cdk/aws-ecs";
import { ResourcesStack } from "../stacks/resources-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import * as ecr from '@aws-cdk/aws-ecr';
import { Role } from "@aws-cdk/aws-iam";
import { IRepository } from "@aws-cdk/aws-ecr";
import { EcsEnvironments } from "../utils/ecsEnvironments";
import { IAM } from "./iam";

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
            taskRole: IAM.createInstanceRole('taskRole', resourcesStack)
        });
        ecsTaskDefinition.addContainer(containerName, {
            containerName: containerName,
            image: ContainerImage.fromRegistry('bitnami/moodle:3.11.6-debian-10-r27'),
            memoryLimitMiB: EcsEnvironments.ECS_TASK_CONTAINERS_MEMORY_LIMIT,
            portMappings: [{ containerPort: EcsEnvironments.ECS_MOODLE_PORT }],
            environment: {
                ['MOODLE_HOST']:'tgcin.com',
                ['MOODLE_REVERSEPROXY']:'true',
                ['MOODLE_SSLPROXY']:'true',
                ['MOODLE_DATABASE_PASSWORD']:'T3st3nd412',
                ['MOODLE_DATABASE_USER']:'dbuser',
                ['MOODLE_DATABASE_NAME']:'moodledb'
            }
        });
        return ecsTaskDefinition
    }

    public static createCapacityProvider(resourcesStack: ResourcesStack, autoScalingGroup: IAutoScalingGroup): AsgCapacityProvider {
        const capacityProvider = new AsgCapacityProvider(resourcesStack, 'AsgCapacityProvider', {
            capacityProviderName:  `${StackEnviroments.RESOURCES_PREFIX}ecsCapacityProvider`,
            autoScalingGroup: autoScalingGroup,
            enableManagedTerminationProtection: false,
            enableManagedScaling: true,
            targetCapacityPercent: EcsEnvironments.ECS_TARGET_CAPACITY_PERCENT,
            canContainersAccessInstanceRole: true
        });
        return capacityProvider;
    }

    public static createECSServices(resourcesStack: ResourcesStack, ecsCluster: ICluster): Ec2Service[] {
        const moodleService = new Ec2Service(resourcesStack, `${StackEnviroments.RESOURCES_PREFIX}moodleService`, {
            cluster: ecsCluster,
            taskDefinition: this.createEcsTaskDefinition(resourcesStack, 'moodle', EcsEnvironments.ECS_MOODLE_PORT),
            desiredCount: 1
        });
        this.configureECSAutoScaling('moodle', moodleService);
        return [moodleService];
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
