import { App, CfnElement, Stack, StackProps } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { LoadBalancer } from '../resources/loadBalancer';
import { ECS } from '../resources/ecs';
import { SecurityGroups } from '../resources/securityGroups';

interface ResourcesStackProps extends StackProps {
  readonly vpc: IVpc;
}

export class ResourcesStack extends Stack {
  readonly vpc;
  constructor(scope: App, id: string, props: ResourcesStackProps) {
    super(scope, id, props);
    this.vpc = props.vpc;
    const ecsService = this.createECSResources();
    LoadBalancer.createLoadBalancer(this, ecsService);
  }

  // protected allocateLogicalId(cfnElement: CfnElement): string {
  //   let logicalId = super.allocateLogicalId(cfnElement);
  //   const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

  //   logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
  //   return logicalId;
  // }

  private createECSResources() {
    const taskDefinition = ECS.createECSEc2TaskDefinition(this);
    const autoScalingGroup = ECS.createAutoScalingGroup(this);
    const capacityProvider = ECS.createCapacityProvider(this, autoScalingGroup);
    const ecsCluster = ECS.createECSCluster(this, capacityProvider);
    const ecsService = ECS.createECSService(this, ecsCluster, taskDefinition);
    return ecsService;
  }
}
