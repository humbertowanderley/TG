
import { FileSystem, LifecyclePolicy, OutOfInfrequentAccessPolicy, PerformanceMode } from "aws-cdk-lib/aws-efs";
import { ResourcesStack } from "../stacks/resources-stack";

export class EFS {
    public static efs: FileSystem;

    public static createEFS(resourcesStack: ResourcesStack) {

        this.efs = new FileSystem(resourcesStack, 'efs', {
            vpc: resourcesStack.vpc
        });

        this.efs._enableCrossEnvironment();


    }
}
