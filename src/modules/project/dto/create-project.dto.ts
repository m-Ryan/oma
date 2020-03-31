export class CreateProjectDto {
  readonly name: string;
  readonly git_path: string;
  readonly envs: {
    name: string;
    public_path: string;
    env_name: string;
    ssh_id?: number;
  }[]
}
