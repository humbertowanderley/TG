import { CfnOutput, CfnParameter, Duration, Fn, RemovalPolicy, SecretValue } from "@aws-cdk/core";
import { AutoScalingGroup } from "@aws-cdk/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port, InstanceClass, InstanceSize, SubnetType } from "@aws-cdk/aws-ec2";
import { EcsOptimizedImage } from "@aws-cdk/aws-ecs";
import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { ResourcesStack } from "../stacks/resources-stack";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, IDatabaseInstance, MariaDbEngineVersion } from "@aws-cdk/aws-rds";

export class RDS {
    public static dbInstance : IDatabaseInstance;

    public static createRDS(resourcesStack: ResourcesStack) {
        this.dbInstance = new DatabaseInstance(resourcesStack, 'db-instance', {
            vpc: resourcesStack.vpc,
            vpcSubnets: {
                subnets: [
                    Subnet.fromSubnetId(resourcesStack, 'dbSubnet', Fn.importValue('IsolatedSubnet')),
                    Subnet.fromSubnetId(resourcesStack, 'dbSubnet2', Fn.importValue('IsolatedSubnet2'))]
            },
            engine: DatabaseInstanceEngine.mariaDb({
                version: MariaDbEngineVersion.VER_10_2
            }),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            credentials: Credentials.fromPassword('dbuser', SecretValue.plainText('T3st3nd412')),
            multiAz: false,
            allocatedStorage: 100,
            maxAllocatedStorage: 105,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(1),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: 'bitnami_moodle',
            publiclyAccessible: false,
        });

        this.dbInstance.connections.allowDefaultPortFrom(Peer.ipv4('10.0.0.0/16'));

        new CfnOutput(resourcesStack, 'dbEndpoint', {
            value: this.dbInstance.instanceEndpoint.hostname,
        });
    }
}
