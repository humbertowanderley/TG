import * as cdk from "aws-cdk-lib";
import { ECS } from "../resources/ecs";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Fn } from "aws-cdk-lib";
import { NLB } from "../resources/loadBalancer";
import { ASG } from "../resources/autoScalingGroup";
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
      ASG.createAutoScalingGroup(this);
      ECS.createCapacityProvider(this, ASG.autoScalingGroup);
      ECS.createECSCluster(this, ECS.capacityProvider);
      ECS.createECSServices(this, ECS.ecsCluster);
      NLB.createLoadBalancer(this, ECS.grafanaService);
      // this.addDependencies();


    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private addDependencies(): void {
    ECS.capacityProvider.node.addDependency(ASG.autoScalingGroup);
    ECS.ecsCluster.node.addDependency(ECS.capacityProvider);
    ECS.grafanaService.node.addDependency(ECS.ecsCluster);
    NLB.networkLoadBalancer.node.addDependency(ECS.grafanaService);
  }

  // protected override allocateLogicalId(cfnElement: cdk.CfnElement): string {
  //   let logicalId = super.allocateLogicalId(cfnElement);
  //   const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;
  //   if (!logicalId.includes('ecsCluster'))
  //     logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
  //   return logicalId;
  // }
}
