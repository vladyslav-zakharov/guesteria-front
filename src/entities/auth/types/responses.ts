export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IUserResponse {
  user: IUser;
}
