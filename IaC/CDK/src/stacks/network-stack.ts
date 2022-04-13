import * as cdk from "@aws-cdk/core";
import { IVpc, SubnetType, Vpc } from "@aws-cdk/aws-ec2";
import { CfnOutput, Fn } from "@aws-cdk/core";
import { Subnets } from "../resources/subnets";

export class NetworkStack extends cdk.Stack {
  readonly vpc: IVpc;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    try {
      super(scope, id, props);
      this.vpc = this.createVPC();

      this.createNetworkCfnParameters();
      this.createSubnets();
      this.createACLs();
      this.createSubnetGroups();
      this.createSecurityGroups();
      this.createNetworkOutputs();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  protected override allocateLogicalId(cfnElement: cdk.CfnElement): string {
    let logicalId = super.allocateLogicalId(cfnElement);
    const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

    logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
    return logicalId;
  }

  private createVPC(): IVpc {
    const vpc = new Vpc(this, 'VPC', {
      vpcName: 'VPC',
      maxAzs: 1,
      cidr: '10.0.0.0/16',
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'Public',
        subnetType: SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: 'EC2Private',
        subnetType: SubnetType.PRIVATE_WITH_NAT
      },
      {
        cidrMask: 24,
        name: 'DatabaseIsolated',
        subnetType: SubnetType.PRIVATE_ISOLATED
      }],
      
    });
    

    return vpc;
  }

  private createSecurityGroups(): void {

  }

  private createSubnets(): void {
    Subnets.createIsolatedSubnet(this);
  }

  private createACLs(): void {

  }

  private createSubnetGroups(): void {

  }

  private createNetworkCfnParameters(): void {

  }

  private createNetworkOutputs(): void {
    new CfnOutput(this, 'VPCOutput', {
      exportName: 'VPC',
      value: this.vpc.vpcId
    });

    new CfnOutput(this, 'PrivateSubnetOutput', {
      exportName: 'PrivateSubnet',
      value: this.vpc.privateSubnets[0].subnetId
    });

    new CfnOutput(this, 'PublicSubnetOutput', {
      exportName: 'PublicSubnet',
      value: this.vpc.publicSubnets[0].subnetId
    });

    new CfnOutput(this, 'IsolatedSubnetOutput', {
      exportName: 'IsolatedSubnet',
      value: this.vpc.isolatedSubnets[0].subnetId
    })
    Subnets.createOutputs(this);
  }
}
