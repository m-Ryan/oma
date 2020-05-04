export interface Omafile {
  node: string;
  stages: IStages;
  uploadDir: string;
}
interface IStages {
  fetch?: { cwd: string; command: string }[];
  build?: { cwd: string; command: string }[];
  deploy?: { cwd: string; command: string }[];
}
