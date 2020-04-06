export interface Omafile {
  node: string;
  stages: IStages;
  uploadDir: string;
}
interface IStages {
  fetch?: string | string[];
  build?: string | string[];
  deploy?: string | string[];
}