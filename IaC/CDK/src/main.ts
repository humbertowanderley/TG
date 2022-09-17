#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ResourcesStack } from './stacks/resources-stack';
import { NetworkStack } from './stacks/network-stack';
import { StorageStack } from './stacks/storage-stack';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'network-stack');

const storageStack = new StorageStack(app, 'storage-stack');

const infraStack = new ResourcesStack(app, 'infra-stack');

storageStack.addDependency(networkStack);
infraStack.addDependency(storageStack);