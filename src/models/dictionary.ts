export interface Words {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  active: boolean;
  name: string;
  description: string | null;
  url: string | null;
}

export interface TagSignsResponse {
  tags: string;
  signs: string[];
}
