export interface Omafile { node: string; stages: IStages; }
interface IStages { start?: string; build?: string; deploy?: string; }