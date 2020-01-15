import {promises as fs} from 'fs';
import * as path from 'path';

export async function writeFile(fileName: string, content: string): Promise<void> {
  const dirName = path.join(__dirname, '../generated');

  try {
    await fs.mkdir(dirName);
  } catch (error) {}

  await fs.writeFile(path.join(dirName, fileName), content, 'utf-8');
}
