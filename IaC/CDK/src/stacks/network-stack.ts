import * as cdk from "aws-cdk-lib";
import { InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, ISecurityGroup, IVpc, Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnElement, CfnOutput, Fn } from "aws-cdk-lib";
import { Subnets } from "../resources/subnets";
import { StackEnviroments } from "../utils/stackEnvironments";

export class NetworkStack extends cdk.Stack {
  readonly vpc: IVpc;
  private endpointSG: ISecurityGroup;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    try {
      super(scope, id, props);
      this.vpc = this.createVPC();

      this.createNetworkCfnParameters();
      this.createSubnets();
      this.createACLs();
      this.createSubnetGroups();
      this.createSecurityGroups();
      // this.createVpcEndpoints();
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
      maxAzs: 1,
      cidr: '10.0.0.0/16',
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'public',
        subnetType: SubnetType.PUBLIC
      },
      {
        cidrMask: 24,
        name: 'Ec2Private',
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
      }],
      
    });
    return vpc;
  }

  private createSecurityGroups(): void {
    this.endpointSG = new SecurityGroup(this, 'endPointSecurityGroup', {
      securityGroupName: 'endpointSG',
      allowAllOutbound: true,
      vpc: this.vpc
    });

    this.endpointSG.addIngressRule(Peer.ipv4(this.vpc.vpcCidrBlock), Port.tcp(443));
  }

  private createSubnets(): void {
    Subnets.createIsolatedSubnet(this);
  }

  private createACLs(): void {

  }

  // private createVpcEndpoints(): void {

  //   // ECR Required Endpoints

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-ECR-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.ECR,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]]
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-ECR-DOCKER-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]]
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-S3-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.S3,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     privateDnsEnabled: false,
  //     securityGroups: [this.endpointSG]
  //   });

  //   // ECS Required Endpoints
  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-ECS-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.ECS,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-ECS_TELEMETRY-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-ECS_AGENT-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.ECS_AGENT,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   // Logs Endpoint
  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-CLOUDWATCH-LOGS-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]

  //   });

  //   // SSM Required Endpoints
  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-SSM-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.SSM,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     }
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-SSM-MESSAGES-Interface-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]
  //   });

  //   new InterfaceVpcEndpoint(this, `${StackEnviroments.RESOURCES_PREFIX}-EC2-MESSAGES-Endpoint`, {
  //     service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
  //     vpc: this.vpc,
  //     subnets: {
  //       subnets: [this.vpc.isolatedSubnets[2]],
  //     },
  //     securityGroups: [this.endpointSG]
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

    new CfnOutput(this, `DatabaseSubnet1Output`, {
      exportName: 'DatabaseSubnet1',
      value: Subnets.databaseSubnet1.subnetId
    });

    new CfnOutput(this, `DatabaseSubnet2Output`, {
      exportName: 'DatabaseSubnet2',
      value: Subnets.databaseSubnet2.subnetId
    });

    new CfnOutput(this, `Ec2PrivateSubnetOutput`, {
      exportName: 'Ec2PrivateSubnet',
      value: this.vpc.privateSubnets[0].subnetId
    });
  }
}
