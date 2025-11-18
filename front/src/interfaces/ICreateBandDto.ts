import IBandMember from "./IBandMemberDto";

interface CreateBandDto {
    bandName: string;
    bandDescription: string;
    formationDate: string;
    urlImage: string;
    genres: string[];
    members: IBandMember[];
}

export default CreateBandDto