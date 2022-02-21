import { Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { NetworkStack } from "../stacks/networkStack";

export class SecurityGroups {

    public static createEc2InstancesSecurityGroup(networkStack: NetworkStack, albSecurityGroupId: string) {
        const ec2InstancesSecurityGroup = new SecurityGroup(networkStack, 'ec2InstanceSecurityGroup', {
            vpc: networkStack.vpc
        });
        ec2InstancesSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.allTraffic());
        ec2InstancesSecurityGroup.addIngressRule(Peer.securityGroupId(albSecurityGroupId), Port.allTcp());
        return ec2InstancesSecurityGroup;
    }

    public static createALBSecurityGroup(networkStack: NetworkStack) {
        const albSecurityGroup = new SecurityGroup(networkStack, 'albSecurityGroup', {
            vpc: networkStack.vpc
        });

        albSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.allTraffic());
        albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
        return albSecurityGroup;
    }
}