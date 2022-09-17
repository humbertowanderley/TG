import * as cdk from "aws-cdk-lib";
import { ECS } from "../resources/ecs";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnOutput, Fn } from "aws-cdk-lib";
import { NLB } from "../resources/loadBalancer";
import { ASG } from "../resources/autoScalingGroup";
import { RDS } from "../resources/rds";


export class StorageStack extends cdk.Stack {
    readonly vpc: IVpc;

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        try {
            super(scope, id, props);
            this.vpc = Vpc.fromVpcAttributes(this, 'storageStackVpc', {
                vpcId: Fn.importValue('VPC'),
                availabilityZones: cdk.Stack.of(this).availabilityZones,
                vpcCidrBlock: '10.0.0.0/16'
            });
            RDS.createRDS(this);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
