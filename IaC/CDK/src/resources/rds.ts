import { CfnOutput, CfnParameter, Duration, Fn, RemovalPolicy, SecretValue } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, InstanceType, Subnet, Peer, Port, InstanceClass, InstanceSize, SubnetType } from "aws-cdk-lib/aws-ec2";
import { EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { NetworkStack } from "../stacks/network-stack";
import { StackEnviroments } from "../utils/stackEnvironments";
import { AutoScalingGroupEnviroments } from "../utils/autoScalingGroupEnvironments";
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseInstanceFromSnapshot, IDatabaseInstance, MariaDbEngineVersion, PostgresEngineVersion } from "aws-cdk-lib/aws-rds";
import { StorageStack } from "../stacks/storage-stack";

export class RDS {
    public static dbInstance: IDatabaseInstance;

    public static createRDS(storageStack: StorageStack) {

        // this.dbInstance = new DatabaseInstanceFromSnapshot(storageStack, 'db-instance', {
        //     vpc: storageStack.vpc,
        //     vpcSubnets: {
        //         subnets: [
        //             Subnet.fromSubnetId(storageStack, 'dbSubnet', Fn.importValue('IsolatedSubnet')),
        //             Subnet.fromSubnetId(storageStack, 'dbSubnet2', Fn.importValue('IsolatedSubnet2'))]
        //     },
        //     engine: DatabaseInstanceEngine.mariaDb({
        //         version: MariaDbEngineVersion.VER_10_2
        //     }),
        //     snapshotIdentifier: 'initialuserdata',
        //     instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
        //     multiAz: false,
        //     allowMajorVersionUpgrade: false,
        //     autoMinorVersionUpgrade: true,
        //     backupRetention: Duration.days(1),
        //     deleteAutomatedBackups: true,
        //     removalPolicy: RemovalPolicy.DESTROY,
        //     deletionProtection: false,
        //     publiclyAccessible: false,

        // });
        this.dbInstance = new DatabaseInstance(storageStack, `${StackEnviroments.RESOURCES_PREFIX}DbInstance`, {
            vpc: storageStack.vpc,
            vpcSubnets: {
                subnets: [
                    Subnet.fromSubnetId(storageStack, 'dbSubnet', Fn.importValue('DatabaseSubnet1')),
                    Subnet.fromSubnetId(storageStack, 'dbSubnet2', Fn.importValue('DatabaseSubnet2'))]
            },
            engine: DatabaseInstanceEngine.postgres({
                version: PostgresEngineVersion.VER_11
            }),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            credentials: Credentials.fromPassword('dbuser', SecretValue.plainText('T3st4nd423')),
            multiAz: false,
            allocatedStorage: 100,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(1),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: 'grafana',
            publiclyAccessible: false,
        });

        this.dbInstance.connections.allowDefaultPortFrom(Peer.ipv4(storageStack.vpc.vpcCidrBlock));

        new CfnOutput(storageStack, 'dbEndpoint', {
            exportName: 'DatabaseEndpoint',
            value: this.dbInstance.instanceEndpoint.socketAddress,
        });
    }
}
