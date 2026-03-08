import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-(--mantine-color-gray-0) p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignUp
                    appearance={{
                        variables: {
                            colorPrimary: "#228be6",
                            borderRadius: "var(--mantine-radius-md)",
                        },
                        elements: {
                            card: "shadow-xl border border-(--mantine-color-default-border) bg-(--mantine-color-body)",
                            formButtonPrimary: "bg-(--mantine-color-blue-filled) text-white hover:bg-(--mantine-color-blue-filled-hover)",
                        },
                    }}
                />
            </div>
        </div>
    );
}
