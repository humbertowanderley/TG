import * as cdk from '@aws-cdk/core';
import { ResourcesStack } from './stacks/resources-stack';
import { NetworkStack } from './stacks/network-stack';

const app = new cdk.App();

const dirNetworkStack = new NetworkStack(app, 'dir-network-cdk-ecs-poc');

const dirStack = new ResourcesStack(app, 'dirinfra-cdk-ecs-poc');

dirStack.addDependency(dirNetworkStack);
