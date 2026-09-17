import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Execute the actual TypeScript module with explicit in-memory dependencies.
// No Next server, environment files, Supabase connection, or network is used.
export async function loadTypeScriptModule(relativePath, dependencies = {}) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: relativePath,
  });
  const module = { exports: {} };
  const requireStub = (specifier) => {
    assertDependency(specifier, dependencies);
    return dependencies[specifier];
  };
  const processStub = { env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.invalid',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'unit-test-placeholder',
  } };
  new Function('require', 'module', 'exports', 'process', outputText)(requireStub, module, module.exports, processStub);
  return module.exports;
}

function assertDependency(specifier, dependencies) {
  if (!Object.hasOwn(dependencies, specifier)) {
    throw new Error(`Unexpected test dependency: ${specifier}`);
  }
}
