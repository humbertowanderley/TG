import * as cdk from "aws-cdk-lib";
import { ECS } from "../resources/ecs";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnOutput, Fn } from "aws-cdk-lib";
import { NLB } from "../resources/loadBalancer";
import { ASG } from "../resources/autoScalingGroup";
import { RDS } from "../resources/rds";
import { IAM } from "../resources/iam";


export class ResourcesStack extends cdk.Stack {
  readonly vpc: IVpc;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    try {
      super(scope, id, props);
      this.vpc = Vpc.fromVpcAttributes(this, 'resourcesStackVpc', {
        vpcId: Fn.importValue('VPC'),
        availabilityZones: cdk.Stack.of(this).availabilityZones,
        vpcCidrBlock: '10.0.0.0/16'
      });
      // Elasticache.createElasticache(this);
      IAM.createInstanceRole(this);
      const ecsServices = this.createECSResources();
      // NLB.createLoadBalancer(this, ecsServices[0]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // protected override allocateLogicalId(cfnElement: cdk.CfnElement): string {
  //   let logicalId = super.allocateLogicalId(cfnElement);
  //   const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;
  //   if (!logicalId.includes('ecsCluster'))
  //     logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
  //   return logicalId;
  // }

  private createECSResources() {
    const autoScalingGroup = ASG.createAutoScalingGroup(this);
    const capacityProvider = ECS.createCapacityProvider(this, autoScalingGroup);
    const ecsCluster = ECS.createECSCluster(this, capacityProvider);
    const ecsServices = ECS.createECSServices(this, ecsCluster);
    return ecsServices;
  }
}
