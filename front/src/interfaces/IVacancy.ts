export default interface IVacancy {
  id: string, // {PK}
  ownerId: string, // {FK}
  ownerType: string,
  name: string,
  vacancyDescription: string,
  requiredEntityType: string,
  isOpen: boolean,
  vacancyImage: string,
}