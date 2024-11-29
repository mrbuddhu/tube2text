import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800",
            headerTitle: "text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-600 dark:text-gray-300",
            socialButtonsBlockButton: "dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
            formFieldLabel: "text-gray-700 dark:text-gray-300",
            formFieldInput: "dark:bg-gray-700 dark:text-white",
            footerActionLink: "text-blue-600 dark:text-blue-400",
          },
        }}
      />
    </div>
  );
}
