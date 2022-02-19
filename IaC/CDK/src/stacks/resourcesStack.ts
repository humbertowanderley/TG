import { App, CfnElement, Stack, StackProps } from 'aws-cdk-lib';
import { ECS } from '../resources/ecs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ResourcesStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    ECS.createECSService(this);
  }

  protected allocateLogicalId(cfnElement: CfnElement): string {
    let logicalId = super.allocateLogicalId(cfnElement);
    const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

    logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
    return logicalId;
  }
}
