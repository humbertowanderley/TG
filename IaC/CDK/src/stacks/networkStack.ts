import { App, aws_ec2, CfnElement, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends Stack {
  readonly vpc: IVpc;
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    this.vpc = this.createVPC();
    this.createNetworkOutputs();
  }

  protected allocateLogicalId(cfnElement: CfnElement): string {
    let logicalId = super.allocateLogicalId(cfnElement);
    const suffixLenToBeRemoval = /[^\s]+[A-F0-9]{16}\b/.test(logicalId) ? 16 : /[^\s]+[A-F0-9]{8}\b/.test(logicalId) ? 8 : 0;

    logicalId = logicalId.substring(0, logicalId.length - suffixLenToBeRemoval);
    return logicalId;
  }

  private createVPC(): IVpc {
    const vpc = new Vpc(this, 'VPC', {
      vpcName: 'VPC',
      maxAzs: 2,
      cidr: '10.0.0.0/16',
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'Public',
        subnetType: aws_ec2.SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: 'Private',
        subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT
      },
      {
        cidrMask: 24,
        name: 'IsolatedA',
        subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED
      },
      {
        cidrMask: 24,
        name: 'IsolatedB',
        subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED
      }],
      
    });

    return vpc;
  }

  private createNetworkOutputs() {
    new CfnOutput(this, 'VPCidOutput', {
      description: 'VPC id',
      value: this.vpc.vpcId,
      exportName: 'VPC'
    });

    new CfnOutput(this, 'PublicSubnet1Output', {
      description: 'Public Subnet1 Id',
      value: this.vpc.publicSubnets[0].subnetId,
      exportName: 'PublicSubnet1'
    })

    new CfnOutput(this, 'PublicSubnet2Output', {
      description: 'Public Subnet2 Id',
      value: this.vpc.publicSubnets[1].subnetId,
      exportName: 'PublicSubnet2'
    })
  }
}
