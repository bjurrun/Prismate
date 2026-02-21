import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignUp
                    appearance={{
                        variables: {
                            colorPrimary: "#09090b",
                            borderRadius: "0.5rem",
                        },
                        elements: {
                            card: "shadow-xl border border-border bg-card",
                            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                        },
                    }}
                />
            </div>
        </div>
    );
}
