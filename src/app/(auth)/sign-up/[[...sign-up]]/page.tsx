import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1
          className="text-sm leading-loose mb-2"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          half
          <br />
          nhalf
        </h1>
        <p className="text-brown-light text-sm">create your account ✦</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-cream border-2 border-tan/40 rounded-2xl warm-shadow p-6",
            headerTitle: "font-bold text-brown",
            headerSubtitle: "text-brown-light",
            formButtonPrimary:
              "bg-peach border-2 border-tan text-brown font-bold rounded-xl hover:bg-tan hover:text-cream transition-colors",
            formFieldInput:
              "border-2 border-tan/50 rounded-xl bg-cream text-brown focus:border-peach focus:ring-0",
            footerActionLink: "text-tan hover:text-peach font-semibold",
          },
        }}
      />
    </div>
  );
}
