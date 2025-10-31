
import LoginForm from "@/src/components/LoginForm";
import Link from "next/link";

export default function LoginPage () {
    return (
    <div className="flex items-center justify-center bg-black-50">
        
        <div className="w-full max-w-md p-9">
        <LoginForm />
        </div>
    </div>);
}