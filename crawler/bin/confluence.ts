import {ConfluenceClient} from 'confluence.js';
import {GetContentById} from 'confluence.js/out/api/parameters';
import {mkdirSync, writeFileSync} from 'fs';
import {basename, dirname} from 'path';

const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN ?? '';
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL ?? 'email@domain.com';
const CONFLUENCE_HOST =
  process.env.CONFLUENCE_HOST ?? 'https://company.atlassian.net';
const OUTPUT_DIR = process.env.OUTPUT_DIR;

const client = new ConfluenceClient({
  host: CONFLUENCE_HOST,
  authentication: {
    basic: {
      email: CONFLUENCE_EMAIL,
      apiToken: CONFLUENCE_API_TOKEN,
    },
  },
});

async function getContentByIdRecursive(
  id: string,
  {parentFilePath}: {parentFilePath: string | null} = {parentFilePath: null}
) {
  console.log(`getContentByIdRecursive... id=${id}`);
  const content = await client.content.getContentById({
    id,
    expand: [
      'body.storage',
      GetContentById.Expand.LastUpdated,
      GetContentById.Expand.PageChildren,
    ],
  });
  console.log(`getContentByIdRecursive id=${id} -> title=${content.title}`);

  const link = `${content._links!.base}${content._links!.webui}`;
  let filePath = `${OUTPUT_DIR}/${new URL(link).pathname}.html`;
  if (typeof parentFilePath === 'string') {
    // use nested path for child page
    const parentDirPath = dirname(parentFilePath);
    filePath = `${parentDirPath}/${content.id}/${basename(filePath)}`;
  }

  const metadata = {
    metadataAttributes: {
      id,
      lastUpdated: content.history!.lastUpdated!.when,
      link,
      title: content.title,
    },
  };

  const html = content.body!.storage!.value.trim();
  if (html.length > 50) {
    mkdirSync(dirname(filePath), {recursive: true});
    writeFileSync(filePath, html);
    writeFileSync(`${filePath}.metadata.json`, JSON.stringify(metadata));
    console.log(`getContentByIdRecursive id=${id} -> filePath=${filePath}`);
  } else {
    console.warn(
      `getContentByIdRecursive id=${id} -> html.length is only ${html.length}`
    );
  }

  const children = content.children!.page!;
  if (children.size > children.limit!) {
    console.warn({children});
    throw new Error('children.size > children.limit');
  }

  for (const child of children.results) {
    console.log(`getContentByIdRecursive id=${id} -> child.id=${child.id}`);
    await getContentByIdRecursive(child.id, {parentFilePath: filePath});
  }
}

(async function main() {
  for (const id of process.argv) {
    if (id.match(/^\d+$/)) {
      await getContentByIdRecursive(id);
    }
  }
})();
