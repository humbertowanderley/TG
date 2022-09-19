import { CfnOutput, Duration, Fn} from "aws-cdk-lib";
import { INetworkAcl, Subnet} from "aws-cdk-lib/aws-ec2";
import { Ec2Service } from "aws-cdk-lib/aws-ecs";
import { INetworkLoadBalancer, NetworkLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ResourcesStack } from "../stacks/resources-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { EcsEnvironments } from "../utils/ecsEnvironments";

export class NLB {
    public static networkLoadBalancer: INetworkLoadBalancer;
    public static createLoadBalancer(resourcesStack: ResourcesStack, grafanaService: Ec2Service): void {

        this.networkLoadBalancer = new NetworkLoadBalancer(resourcesStack, "NetworkLoadBalancer", {
            loadBalancerName: `${StackEnviroments.RESOURCES_PREFIX}NetworkLoadBalancer`,
            vpc: resourcesStack.vpc,
            internetFacing: true,
            vpcSubnets: {
                subnets: [
                    Subnet.fromSubnetId(resourcesStack, 'nlbSubnetId1', Fn.importValue('PublicSubnet1'))
                ]
            }
        });

        const grafanaListener = this.networkLoadBalancer.addListener('grafanaListener', {
            port: 80
        });

        grafanaListener.addTargets('grafana-target', {
            port: EcsEnvironments.ECS_GF_PORT,
            targets: [grafanaService],
            healthCheck: {
                unhealthyThresholdCount: 3,
                healthyThresholdCount: 3,
                interval: Duration.seconds(30),
            },
        });

        new CfnOutput(resourcesStack, 'nlbDNS', {
            exportName: 'nlbDNS',
            value: this.networkLoadBalancer.loadBalancerDnsName,
        });
    }
}