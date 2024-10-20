import {
  Dirent,
  mkdirSync,
  opendirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import {basename, dirname, extname, join} from 'path';
import pm from 'picomatch';
import {SimpleGit, simpleGit} from 'simple-git';
import * as v from 'valibot';

const OUTPUT_DIR = process.env.OUTPUT_DIR;
const TEMP_DIR = `${OUTPUT_DIR}-temp`;

const InputSchema = v.object({
  contentPatterns: v.optional(v.array(v.string())),
  pathPatterns: v.optional(v.array(v.string())),
  remoteBranch: v.optional(v.string()),
  remoteUrl: v.string(),
  sparseCheckout: v.optional(v.array(v.string())),
});

type Input = v.InferOutput<typeof InputSchema>;

interface MergedInput extends Omit<Required<Input>, 'pathPatterns'> {
  baseDir: string;
  outputBaseDir: string;
  pathMatcher?: pm.Matcher;
}

async function shallowCloneSparseCheckout({
  baseDir,
  remoteBranch,
  remoteUrl,
  sparseCheckout,
}: MergedInput): Promise<SimpleGit> {
  try {
    if (statSync(baseDir).isDirectory()) {
      console.warn(
        `shallowCloneSparseCheckout: skipped cloning into ${baseDir}`
      );
      return simpleGit({baseDir});
    }
  } catch {
    // intentionally left empty
  }

  mkdirSync(baseDir, {recursive: true});
  const git = simpleGit({baseDir});
  await git.init();
  await git.addRemote('origin', remoteUrl);

  if (Array.isArray(sparseCheckout) && sparseCheckout.length > 0) {
    git.addConfig('core.sparseCheckout', 'true');
    writeFileSync(
      `${baseDir}/.git/info/sparse-checkout`,
      sparseCheckout.join('\n')
    );
  }

  await git.pull('origin', remoteBranch, {'--depth': 1});
  console.log(`shallowCloneSparseCheckout -> cloned into ${baseDir}`);

  return git;
}

async function opendirRecursive(
  input: MergedInput & {gitHead: string},
  parent?: Dirent
) {
  if (typeof parent !== 'undefined') {
    if (parent.name.startsWith('.')) {
      // skip hidden directories
      return;
    }

    switch (parent.name) {
      case 'build':
      case 'dist':
      case 'node_modules':
        // also skip these
        return;
    }
  }

  const path = parent ? `${parent.path}/${parent.name}` : input.baseDir;
  const dir = opendirSync(path);
  const {contentPatterns, pathMatcher} = input;
  for await (const child of dir) {
    if (child.isDirectory()) {
      await opendirRecursive(input, child);
    } else {
      const childPath = join(child.path, child.name);
      const childPathFromBaseDir = childPath.replace(`${input.baseDir}/`, '');
      if (
        typeof pathMatcher === 'function' &&
        pathMatcher(childPathFromBaseDir) === false
      ) {
        continue;
      }

      const contents = readFileSync(childPath).toString('utf8');
      if (Array.isArray(contentPatterns)) {
        const contentsMatched = contentPatterns.some(p => contents.includes(p));
        if (!contentsMatched) {
          continue;
        }
      }

      const extension = extname(child.name).substring(1);
      const filePath = join(input.outputBaseDir, `${childPathFromBaseDir}.md`);
      const markdown = `Below are source code of \`${childPathFromBaseDir}\`\nIn repository ${input.remoteUrl}\n\n\`\`\`${extension}\n${contents}\n\`\`\``;
      mkdirSync(dirname(filePath), {recursive: true});
      writeFileSync(filePath, markdown);
      writeFileSync(
        `${filePath}.metadata.json`,
        JSON.stringify({
          metadataAttributes: {
            link: `${input.remoteUrl}/blob/${input.gitHead}/${childPathFromBaseDir}`,
          },
        })
      );
      console.log(`opendirRecursive -> filePath=${filePath}`);
    }
  }
}

async function parseInput(inputString: string) {
  const input0 = v.parse(InputSchema, JSON.parse(inputString));

  const remoteUrlObj = new URL(input0.remoteUrl);
  const input: MergedInput = {
    contentPatterns: [],
    remoteBranch: 'main',
    sparseCheckout: [],
    ...input0,
    baseDir: `${TEMP_DIR}/${basename(input0.remoteUrl)}`,
    outputBaseDir: `${OUTPUT_DIR}/${remoteUrlObj.host}${remoteUrlObj.pathname}`,
    pathMatcher: Array.isArray(input0.pathPatterns)
      ? pm(input0.pathPatterns)
      : undefined,
  };

  const git = await shallowCloneSparseCheckout(input);
  const gitHead = await git.revparse(['HEAD']);
  await opendirRecursive({...input, gitHead});
}

(async function main() {
  for (const inputString of process.argv) {
    if (inputString.startsWith('{') && inputString.endsWith('}')) {
      await parseInput(inputString);
    }
  }
})();
