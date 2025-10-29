"use client";


import RegisterForm from "@/src/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return <div className=" flex items-center justify-center bg-black-50">
       <div className="w-full max-w-md p-9">
        <RegisterForm />
        <p className="text-teal-500 text-center m-auto text-sm text-white-600">
            Ya tienes cuenta? {" "}
            <Link className= "text-teal-500 underline font-semibold" href={"/login"}>Log in</Link>
        </p>
        </div>
        </div>
}