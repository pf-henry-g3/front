export interface IBand {
  id: number, // {PK}
  leaderId: string, // {FK}
  name: string,
  bandDescription: string,
  category: string,
  formationDate: string,
  bandImage: string,
}