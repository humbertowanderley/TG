#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from './stacks/networkStack';
import { ResourcesStack } from './stacks/resourcesStack';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'networkStack');
const resourcesStack = new ResourcesStack(app, 'resourcesStack', {
    vpc: networkStack.vpc
});


resourcesStack.addDependency(networkStack);
