import ts from 'typescript';

const nodes: any = {}; // add your AST here

const sourceFile = ts.createSourceFile('', '', ts.ScriptTarget.ESNext);
const printer = ts.createPrinter();
const sourceCode = printer.printNode(ts.EmitHint.Unspecified, nodes, sourceFile);

console.log(sourceCode);
