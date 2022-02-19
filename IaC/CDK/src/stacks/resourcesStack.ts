import { App, CfnElement, Stack, StackProps } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { LoadBalancer } from '../resources/loadBalancer';
import { ECS } from '../resources/ecs';

interface ResourcesStackProps extends StackProps {
  readonly vpc: IVpc;
}

export class ResourcesStack extends Stack {
  constructor(scope: App, id: string, props: ResourcesStackProps) {
    super(scope, id, props);
    const ecsService = ECS.createECSService(this, props.vpc);
    LoadBalancer.createLoadBalancer(this, props.vpc, ecsService);
  }

  protected allocateLogicalId(cfnElement: CfnElement): string {
    let logicalId = super.allocateLogicalId(cfnElement);
    const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

    logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
    return logicalId;
  }
}
