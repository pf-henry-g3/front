export default interface IVacancy {
  id: string, // {PK}
  name: string,
  vacancyDescription: string,
  isOpen: boolean,
  urlImage: string,
}