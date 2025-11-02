"use client";


import RegisterForm from "@/src/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return <div className=" flex items-center justify-center bg-black-50">
       <div className="w-full max-w-xxl p-9">
        <RegisterForm />
        </div>
        </div>
}