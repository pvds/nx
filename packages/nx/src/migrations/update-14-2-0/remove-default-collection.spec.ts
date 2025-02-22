import { createTreeWithEmptyWorkspace } from '../../generators/testing-utils/create-tree-with-empty-workspace';
import type { Tree } from '../../generators/tree';
import removeDefaultCollection from './remove-default-collection';
import {
  readNxJson,
  updateNxJson,
} from '../../generators/utils/project-configuration';

describe('remove-default-collection', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should remove default collection from nx.json', async () => {
    const config = readNxJson(tree);
    config.cli = {
      defaultCollection: 'default-collection',
      defaultProjectName: 'default-project',
    };
    updateNxJson(tree, config);

    await removeDefaultCollection(tree);

    expect(readNxJson(tree).cli).toEqual({
      defaultProjectName: 'default-project',
    });
  });

  it('should remove cli entirely if defaultCollection was the only setting', async () => {
    const config = readNxJson(tree);
    config.cli = {
      defaultCollection: 'default-collection',
    };
    updateNxJson(tree, config);

    await removeDefaultCollection(tree);

    expect(readNxJson(tree).cli?.defaultCollection).toBeUndefined();
  });

  it('should not error when "cli" is not defined', async () => {
    const config = readNxJson(tree);
    delete config.cli;
    updateNxJson(tree, config);

    await expect(removeDefaultCollection(tree)).resolves.not.toThrow();
  });
});
