
import LoginForm from "@/src/components/LoginForm";
import Link from "next/link";

export default function LoginPage () {
    return (
    <div className="flex items-center justify-center bg-black-50">
        
        <div className="w-full max-w-md p-9">
        <LoginForm />
             <p className="text-teal-500 text-center m-auto text-sm text-white-600">
             No tienes cuenta ? {" "} 
            
                <Link className= "text-teal-500 underline font-semibold" href={"/register"}>Registrate</Link>
            </p>
        </div>

    </div>);
}