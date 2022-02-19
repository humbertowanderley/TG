#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from './stacks/networkStack';
import { ResourcesStack } from './stacks/resourcesStack';

const app = new cdk.App();

const network = new NetworkStack(app, 'networkStack');
const resourcesStack = new ResourcesStack(app, 'resourcesStack');


// resourcesStack.addDependency(network);
