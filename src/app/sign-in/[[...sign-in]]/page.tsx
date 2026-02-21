import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignIn
                    appearance={{
                        variables: {
                            colorPrimary: "#09090b", // De diepzwarte Zinc-950 kleur
                            borderRadius: "0.5rem",
                            fontFamily: 'inherit',
                        },
                        elements: {
                            card: "shadow-xl border border-border bg-card",
                            headerTitle: "text-2xl font-bold tracking-tight text-foreground",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton:
                                "border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                            formButtonPrimary:
                                "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all",
                            footerActionLink: "text-primary hover:text-primary/90 underline-offset-4 hover:underline",
                        },
                    }}
                />
            </div>
        </div>
    );
}
