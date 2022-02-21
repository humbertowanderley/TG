import { CfnOutput, Duration, Fn } from "aws-cdk-lib";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Ec2Service } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer, ListenerAction, ListenerCondition } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ResourcesStack } from "../stacks/resourcesStack";

export class LoadBalancer {

    public static createLoadBalancer(resourcesStack: ResourcesStack, ecsService: Ec2Service): void {

        const alb = new ApplicationLoadBalancer(resourcesStack, "ApplicationLoadBalancer", {
            vpc: resourcesStack.vpc,
            internetFacing: true,
            securityGroup: SecurityGroup.fromSecurityGroupId(resourcesStack, 'albSGId', Fn.importValue('albSecurityGroupId'))
        });

        const listener = alb.addListener('Listener', {
            port: 80,
            open: true
        });

        listener.addTargets('default-target', {
            port: 80,
            targets: [ecsService],
            healthCheck: {
                path: '/',
                unhealthyThresholdCount: 2,
                healthyThresholdCount: 5,
                interval: Duration.seconds(30),
            },
            stickinessCookieDuration: Duration.days(1)

        });

        listener.addAction('/static', {
            priority: 5,
            conditions: [ListenerCondition.pathPatterns(['/static'])],
            action: ListenerAction.fixedResponse(200, {
                contentType: 'text/html',
                messageBody: '<h1>Static ALB Response</h1>',
            }),
        });

        new CfnOutput(resourcesStack, 'albDNS', {
            exportName: 'albDNS',
            value: alb.loadBalancerDnsName,
        });
    }
}