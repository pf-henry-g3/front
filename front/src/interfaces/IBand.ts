import IBandMember from "./IBandMemberDto";

export interface IBand {
  id: number, // {PK}
  leaderId: string, // {FK}
  bandName: string,
  bandDescription: string,
  category: string,
  formationDate: string,
  urlImage: string,
  averageRating: string,
}