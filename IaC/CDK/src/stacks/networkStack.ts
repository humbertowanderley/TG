import { App, aws_ec2, CfnElement, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import { SecurityGroups } from '../resources/securityGroups';

export class NetworkStack extends Stack {
  public readonly vpc: IVpc;
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);
    this.vpc = this.createVPC();
    this.createECSSecurityGroups();
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
        name: 'EC2Isolated',
        subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED
      },
      {
        cidrMask: 24,
        name: 'DatabaseIsolated',
        subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED
      }],
      
    });

    return vpc;
  }

  private createECSSecurityGroups() {
    const albSecurityGroup = SecurityGroups.createALBSecurityGroup(this);
    const ec2InstancesSecurityGroup = SecurityGroups.createEc2InstancesSecurityGroup(this, albSecurityGroup.securityGroupId);

    new CfnOutput(this, 'albSecurityGroupId', {
      exportName: 'albSecurityGroupId',
      value: albSecurityGroup.securityGroupId
    });

    new CfnOutput(this, 'ec2InstancesSecurityGroup', {
      exportName: 'ec2InstancesSecurityGroup',
      value: ec2InstancesSecurityGroup.securityGroupId
    });
  }
}
