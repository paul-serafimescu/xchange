declare interface IUser {
  readonly user_id?: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password?: string;
  readonly user_avatar: string;
}

export default IUser;
