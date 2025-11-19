import VacancyForm from "@/src/components/Vacancyform";

export default function VacancyPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black-50">
            <div className="w-full p-9 space-y-6">
                <VacancyForm />
            </div>
        </div>
    );
}