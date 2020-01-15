import Handlebars from 'handlebars';

import jsonContent from './swagger.json';
import {writeFile} from './fileUtil';

type InterfaceDeclaration = {isRequired: boolean; name: string; type: string};
type PropertiesSchema = Record<string, {type: string} | undefined>;

interface TypeDeclaration {
  basicType: string;
  name: string;
  properties: InterfaceDeclaration[];
}

const handlebarsTemplate = `{{{basicType}}} {{{name}}} {
  {{#each properties}}
    {{{this.name}}}{{#if this.isRequired}}{{else}}?{{/if}}: {{{this.type}}};
  {{/each}}
}`;

function mapSwaggerTypeToKeyword(type: string): string {
  switch (type) {
    case 'integer':
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    default:
      return 'unknown';
  }
}

function createDeclaration(
  declarationName: string,
  propertiesSchema: PropertiesSchema,
  requiredProperties: string[]
): TypeDeclaration {
  const mappedProperties = Object.entries(propertiesSchema).map(([propertyName, propertySchema]) => {
    const typeKeyword = mapSwaggerTypeToKeyword(propertySchema!.type);
    const isRequired = requiredProperties.includes(propertyName);
    return {name: propertyName, isRequired, type: typeKeyword};
  });

  return {
    basicType: 'interface',
    name: declarationName,
    properties: mappedProperties,
  };
}

function saveDeclarations(declarations: TypeDeclaration[]): Promise<void> {
  const fileName = 'interfaces-hbs.ts';

  const sourceCode = declarations
    .map(declaration => {
      const templateDelegate = Handlebars.compile(handlebarsTemplate);
      return templateDelegate(declaration);
    })
    .join('\n\n');

  return writeFile(fileName, sourceCode);
}

const declarations = Object.entries(jsonContent.definitions).map(([definitionName, definitionSchema]) =>
  createDeclaration(definitionName, definitionSchema.properties, definitionSchema.required)
);

saveDeclarations(declarations).catch(error => console.error(error));
