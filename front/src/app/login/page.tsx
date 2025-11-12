'use client';

import LoginForm from "@/src/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black-50">
            <div className="w-full max-w-md p-9 space-y-6">
                <LoginForm />
            </div>
        </div>
    );
}