import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
  path: string;
  size: number;
}

/**
 * Récupère récursivement tous les fichiers d'un dossier avec leur taille.
 */
export function getAllFiles(dirPath: string, arrayOfFiles: FileInfo[] = []): FileInfo[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push({
        path: fullPath,
        size: stats.size
      });
    }
  });

  return arrayOfFiles;
}
