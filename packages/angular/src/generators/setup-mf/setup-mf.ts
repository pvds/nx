import type { Tree } from '@nrwl/devkit';
import { formatFiles, readProjectConfiguration } from '@nrwl/devkit';
import type { Schema } from './schema';

import {
  addCypressOnErrorWorkaround,
  addRemoteEntry,
  addRemoteToHost,
  changeBuildTarget,
  fixBootstrap,
  generateWebpackConfig,
  getRemotesWithPorts,
  removeDeadCodeFromRemote,
  setupHostIfDynamic,
  setupServeTarget,
  updateHostAppRoutes,
  updateTsConfigTarget,
} from './lib';
import { getInstalledAngularVersionInfo } from '../utils/angular-version-utils';
import { lt } from 'semver';

export async function setupMf(tree: Tree, options: Schema) {
  const installedAngularInfo = getInstalledAngularVersionInfo(tree);

  if (lt(installedAngularInfo.version, '14.1.0') && options.standalone) {
    throw new Error(
      `The --standalone flag is not supported in your current version of Angular (${installedAngularInfo.version}). Please update to a version of Angular that supports Standalone Components (>= 14.1.0).`
    );
  }
  const projectConfig = readProjectConfiguration(tree, options.appName);

  options.federationType = options.federationType ?? 'static';

  if (options.mfType === 'host') {
    setupHostIfDynamic(tree, options);
    updateHostAppRoutes(tree, options);
  }

  if (options.mfType === 'remote') {
    addRemoteToHost(tree, options);
    addRemoteEntry(tree, options, projectConfig.root);
    removeDeadCodeFromRemote(tree, options);
  }

  const remotesWithPorts = getRemotesWithPorts(tree, options);

  generateWebpackConfig(tree, options, projectConfig.root, remotesWithPorts);

  changeBuildTarget(tree, options);
  updateTsConfigTarget(tree, options);
  setupServeTarget(tree, options);

  fixBootstrap(tree, projectConfig.root, options);

  if (!options.skipE2E) {
    addCypressOnErrorWorkaround(tree, options);
  }

  // format files
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default setupMf;
