import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-(--mantine-color-gray-0) p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignIn
                    appearance={{
                        variables: {
                            colorPrimary: "#228be6",
                            borderRadius: "var(--mantine-radius-md)",
                            fontFamily: 'inherit',
                        },
                        elements: {
                            card: "shadow-xl border border-(--mantine-color-default-border) bg-(--mantine-color-body)",
                            headerTitle: "text-2xl font-bold tracking-tight text-(--mantine-color-text)",
                            headerSubtitle: "text-(--mantine-color-dimmed)",
                            socialButtonsBlockButton:
                                "border border-(--mantine-color-default-border) bg-(--mantine-color-body) hover:bg-(--mantine-color-default-hover) transition-colors",
                            formButtonPrimary:
                                "bg-(--mantine-color-blue-filled) text-white hover:bg-(--mantine-color-blue-filled-hover) shadow-sm transition-all",
                            footerActionLink: "text-(--mantine-color-blue-filled) hover:text-(--mantine-color-blue-filled) underline-offset-4 hover:underline",
                        },
                    }}
                />
            </div>
        </div>
    );
}
