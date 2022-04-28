import { CfnOutput, Duration, Fn} from "@aws-cdk/core";
import { Subnet} from "@aws-cdk/aws-ec2";
import { Ec2Service } from "@aws-cdk/aws-ecs";
import { NetworkLoadBalancer } from "@aws-cdk/aws-elasticloadbalancingv2";
import { ResourcesStack } from "../stacks/resources-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { EcsEnvironments } from "../utils/ecsEnvironments";

export class NLB {

    public static createLoadBalancer(resourcesStack: ResourcesStack, moodleService: Ec2Service): void {

        const nlb = new NetworkLoadBalancer(resourcesStack, "NetworkLoadBalancer", {
            loadBalancerName: `${StackEnviroments.RESOURCES_PREFIX}NetworkLoadBalancer`,
            vpc: resourcesStack.vpc,
            internetFacing: true,
            vpcSubnets: {
                subnets: [
                    Subnet.fromSubnetId(resourcesStack, 'nlbSubnetId2', Fn.importValue('PublicSubnet'))
                ]
            }
        });

        
        const moodleListener = nlb.addListener('authListener', {
            port: 80
        });

        moodleListener.addTargets('auth-target', {
            port: EcsEnvironments.ECS_MOODLE_PORT,
            targets: [moodleService],
            healthCheck: {
                unhealthyThresholdCount: 3,
                healthyThresholdCount: 3,
                interval: Duration.seconds(30),
            },
        });

        new CfnOutput(resourcesStack, 'nlbDNS', {
            exportName: 'nlbDNS',
            value: nlb.loadBalancerDnsName,
        });
    }
}