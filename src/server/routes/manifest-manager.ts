import fs from 'fs';
import path from 'path';
import request from 'request';
import { IS_DEV, WEBPACK_PORT } from '../config';

function getManifestFromWebpack(): Promise<any> {
  return new Promise((resolve, reject) => {
    request.get(`http://localhost:${WEBPACK_PORT}/statics/manifest.json`, {}, (err, data) =>
      err ? reject(err) : resolve(data.body),
    );
  });
}

let manifestStrCache: any;

export async function getManifest(): Promise<object> {
  let manifestStr: string;
  if (IS_DEV) {
    manifestStr = await getManifestFromWebpack();
  } else {
    if (manifestStrCache) {
      manifestStr = manifestStrCache;
    } else {
      manifestStr = fs.readFileSync(path.join(process.cwd(), 'dist', 'statics', 'manifest.json'), 'utf-8').toString();
      manifestStrCache = manifestStr;
    }
  }
  const manifest = JSON.parse(manifestStr);
  return manifest;
}
