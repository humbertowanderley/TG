import * as cdk from "aws-cdk-lib";
import { InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnElement, CfnOutput, Fn } from "aws-cdk-lib";
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

  // protected override allocateLogicalId(cfnElement: CfnElement): string {
  //   let logicalId = super.allocateLogicalId(cfnElement);
  //   const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

  //   logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
  //   return logicalId;
  // }

  private createVPC(): IVpc {
    const vpc = new Vpc(this, 'VPC', {
      vpcName: 'VPC',
      maxAzs: 2,
      cidr: '10.0.0.0/16',
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'public',
        subnetType: SubnetType.PUBLIC
      },
      {
        cidrMask: 24,
        name: 'DatabaseIsolated',
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      {
        cidrMask: 24,
        name: 'Ec2Isolated',
        subnetType: SubnetType.PRIVATE_ISOLATED
      }],

    });


    return vpc;
  }

  private createSecurityGroups(): void {

  }

  private createSubnets(): void {
    // Subnets.createIsolatedSubnet(this);
  }

  private createACLs(): void {

  }

  // private createVpcEndpoints(): void {
  //   new InterfaceVpcEndpoint(this, 'SFV-ECR-DOCKER-Interface-Endpoint', {
  //     service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: this.vpc.privateSubnets
  //     },
  //   });

  //   new InterfaceVpcEndpoint(this, 'SFV-ECR-Interface-Endpoint', {
  //     service: InterfaceVpcEndpointAwsService.ECR,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: this.vpc.privateSubnets,
  //     }
  //   });

  //   new InterfaceVpcEndpoint(this, 'SFV-CLOUDWATCH-LOGS-Interface-Endpoint', {
  //     service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: this.vpc.privateSubnets,
  //     }
  //   });
  // }

  private createSubnetGroups(): void {

  }

  private createNetworkCfnParameters(): void {

  }

  private createNetworkOutputs(): void {
    new CfnOutput(this, 'VPCOutput', {
      exportName: 'VPC',
      value: this.vpc.vpcId
    });

    new CfnOutput(this, 'PublicSubnet1Output', {
      exportName: 'PublicSubnet1',
      value: this.vpc.publicSubnets[0].subnetId
    });

    new CfnOutput(this, 'PublicSubnet2Output', {
      exportName: 'PublicSubnet2',
      value: this.vpc.publicSubnets[1].subnetId
    });

    new CfnOutput(this, `DatabaseSubnet1Output`, {
      exportName: 'DatabaseSubnet1',
      value: this.vpc.isolatedSubnets[0].subnetId
    });

    new CfnOutput(this, `DatabaseSubnet2Output`, {
      exportName: 'DatabaseSubnet2',
      value: this.vpc.isolatedSubnets[1].subnetId
    });

    new CfnOutput(this, `Ec2Subnet1Output`, {
      exportName: 'Ec2Subnet1',
      value: this.vpc.isolatedSubnets[2].subnetId
    });

    new CfnOutput(this, 'Ec2Subnet2Output', {
      exportName: `Ec2Subnet2`,
      value: this.vpc.isolatedSubnets[3].subnetId
    });
    // Subnets.createOutputs(this);
  }
}
