export class CreateUserProfileDto {
  email!: string;
  name!: string;
  userName!: string;
  birthday!: string | Date;
  school!: string;
  grade!: string;
  stream!: string;
}
