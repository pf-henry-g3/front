export default interface IUser {
  id: string, // {PK}
  name: string,
  birthDate: Date,
  aboutMe: string,
  userName: string,
  averageRating: number, //real
  email: string,
  password: string,
  city: string,
  country: string,
  addres: string,
  //latitude: float,
  //longitude: float,
  profilePicture: string,
}