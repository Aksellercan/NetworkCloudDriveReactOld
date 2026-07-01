export interface FileItemDTO {
  id: number;
  name: string;
  hasThumbnail: boolean;
}

export interface FolderItemDTO {
  id: number;
  name: string;
}

export interface FolderMetadata {
  id: number;
  name: string;
}

export interface CurrentUserDTO {
  id: number;
  name: string;
  mail: string;
  role: string;
  lastLogin: string;
}

export type DeletionOptions = 'NORMAL' | 'NUCLEAR' | 'ONLY_IO';
