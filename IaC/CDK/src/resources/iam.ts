import { CfnParameter, Fn } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port } from "aws-cdk-lib/aws-ec2";
import { EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { CompositePrincipal, IRole, ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";

export class IAM {
    public static instanceRole: IRole;
    public static createInstanceRole(resourcesStack: ResourcesStack) {

        this.instanceRole = new Role(resourcesStack, 'instanceRole', {
            assumedBy: new CompositePrincipal( 
                new ServicePrincipal('ecs-tasks.amazonaws.com'),
                new ServicePrincipal('ec2.amazonaws.com'),
                new ServicePrincipal('ssm.amazonaws.com')
            ),
            managedPolicies: [
                ManagedPolicy.fromManagedPolicyArn(resourcesStack, `instanceAmazonECSTaskExecutionRolePolicy`, 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'),
                ManagedPolicy.fromManagedPolicyArn(resourcesStack, `instanceAmazonEC2ContainerServiceforEC2Role`, 'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
            ]
        });
    }

    public static createInstanceSecurityGroup(resourcesStack: ResourcesStack) {
        const instanceSG = new SecurityGroup(resourcesStack, 'instanceSecurityGroup', {
            vpc: resourcesStack.vpc,
            securityGroupName: 'instanceSG',
            allowAllOutbound: true,
        });
        // instanceSG.addIngressRule(Peer.ipv4('10.0.0.0/16'), Port.tcpRange(1024, 65535))
        instanceSG.addIngressRule(Peer.anyIpv4(),Port.allTraffic());
        return instanceSG;
    }
}
