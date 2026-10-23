import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

test('public exports retain typed props without inheriting stricter consumer compiler flags',()=>{
 const root=dirname(dirname(fileURLToPath(import.meta.url)));
 const fixture=mkdtempSync(join(root,'tests','.consumer-'));
 const tsc=join(root,'node_modules/typescript/bin/tsc');
 try{
  writeFileSync(join(fixture,'consumer.tsx'),`
import {ModelSelector,FileDropzone} from '@mingu/interaction-ui';
import {Button,Input,Dialog} from '@mingu/interaction-ui/system';
import {uiCatalog} from '@mingu/interaction-ui/catalog';
const models=[{id:'local:test',name:'Test',provider:'Local'}];
const picker=<ModelSelector models={models} labels={{search:'모델 검색'}} onValueChange={id=>id.toUpperCase()}/>;
const upload=<FileDropzone label="Upload" maxSize={Infinity} onFilesChange={files=>files[0]?.name}/>;
const controls=<><Button type="submit"/><Input aria-label="Name"/><Dialog title="Details" open={false} onOpenChange={()=>{}}>Details</Dialog></>;
const catalog: string | undefined=uiCatalog[0]?.name;
// @ts-expect-error models remain required in the public API
const missing=<ModelSelector/>;
// @ts-expect-error native input props remain typed
const invalid=<Input type="number" min={{bad:true}}/>;
export {picker,upload,controls,catalog,missing,invalid};
`);
  const project=join(fixture,'tsconfig.json');
  writeFileSync(project,JSON.stringify({compilerOptions:{target:'ES2023',lib:['ES2023','DOM','DOM.Iterable'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,noUncheckedIndexedAccess:true,exactOptionalPropertyTypes:true,skipLibCheck:true,noEmit:true},include:['consumer.tsx']}));
  execFileSync(process.execPath,[tsc,'--project',project],{cwd:root,encoding:'utf8',stdio:'pipe'});
  const files=execFileSync(process.execPath,[tsc,'--project',project,'--listFilesOnly'],{cwd:root,encoding:'utf8'}).split('\n');
  assert(files.some(file=>file===join(root,'dist/types/index.d.ts')));
  assert(!files.some(file=>file.startsWith(join(root,'src')+'/')));
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
