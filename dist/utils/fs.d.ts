export interface FileInfo {
    path: string;
    size: number;
}
/**
 * Récupère récursivement tous les fichiers d'un dossier avec leur taille.
 */
export declare function getAllFiles(dirPath: string, arrayOfFiles?: FileInfo[]): FileInfo[];
//# sourceMappingURL=fs.d.ts.map