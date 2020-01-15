import ts from 'typescript';

import jsonContent from './swagger.json';
import {writeFile} from './fileUtil';

type PropertiesSchema = Record<string, {type: string} | undefined>;

function mapSwaggerTypeToKeyword(swaggerType: string): number {
  switch (swaggerType) {
    case 'integer':
    case 'number':
      return ts.SyntaxKind.NumberKeyword;
    case 'string':
      return ts.SyntaxKind.StringKeyword;
    default:
      return ts.SyntaxKind.UnknownKeyword;
  }
}

function createDeclaration(
  declarationName: string,
  propertiesSchema: PropertiesSchema,
  requiredProperties: string[] = []
): ts.InterfaceDeclaration {
  const mappedProperties = Object.entries(propertiesSchema).map(([propertyName, propertySchema]) => {
    // e.g. SyntaxKind.StringKeyword
    const typeSyntaxKind = mapSwaggerTypeToKeyword(propertySchema!.type);

    // e.g. 'string'
    const typeKeyword = ts.createKeywordTypeNode(typeSyntaxKind);

    // e.g. '?'
    const questionMarkToken = requiredProperties.includes(propertyName)
      ? undefined
      : ts.createToken(ts.SyntaxKind.QuestionToken);

    return ts.createPropertySignature(
      undefined,           // readonly?
      propertyName,        // property name
      questionMarkToken,   // required?
      typeKeyword,         // property type
      undefined,           // expression, e.g. '++'
    );
  });

  return ts.createInterfaceDeclaration(
    undefined,             // private?
    undefined,             // readonly?
    declarationName,       // interface name
    undefined,             // generics?
    undefined,             // extends?
    mappedProperties,      // properties
  );
}

function saveDeclarations(declarations: ts.InterfaceDeclaration[]): Promise<void> {
  const fileName = 'interfaces-ts.ts';

  const sourceFile = ts.createSourceFile(fileName, '', ts.ScriptTarget.ESNext);
  const sourceCode = declarations
    .map(declaration => ts.createPrinter().printNode(ts.EmitHint.Unspecified, declaration, sourceFile))
    .join('\n\n');

  return writeFile(fileName, sourceCode);
}

const declarations = Object.entries(jsonContent.definitions).map(([definitionName, definitionSchema]) =>
  createDeclaration(definitionName, definitionSchema.properties, definitionSchema.required)
);

saveDeclarations(declarations).catch(error => console.error(error));
