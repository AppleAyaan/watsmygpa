"use client"

import type React from "react"

import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

const TermsPage: React.FC = () => {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background -z-20" />

      <InteractiveGridPattern className="absolute inset-0 z-0" width={80} height={80} squares={[40, 40]} />

      <div
        className="fixed top-4 left-4 text-2xl cursor-pointer z-50"
        onClick={() => router.push("/")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") router.push("/")
        }}
      >
        <img
          src="/watsmygpa_logo_long_light.png"
          className="block dark:hidden w-auto h-10 sm:h-12 md:h-14 lg:h-16"
          alt="WATsMyGPA logo"
        />
        <img
          src="/watsmygpa_logo_long_dark.png"
          className="hidden dark:block w-auto h-10 sm:h-12 md:h-14 lg:h-16"
          alt="WATsMyGPA logo"
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
        }}
      >
        <h1 style={{ textAlign: "center" }} className="text-2xl md:text-3xl lg:text-4xl font-bold">
          <span className="text-foreground">Terms of Service</span>{" "}
        </h1>
        <br></br>

        <p>
          By using this application, you agree to comply with and be bound by the following terms and conditions. Please
          read them carefully before using the application.
        </p>

        <br />
        <h2 style={{ fontWeight: "bold" }}>Use of Application</h2>
        <p>
          This application is intended for calculating GPAs and providing peer-based insights. All computations are
          performed locally on your device, and any data you provide is optional and under your control. You may choose
          which information to input.
        </p>
        <br />

        <h2 style={{ fontWeight: "bold" }}>User Responsibility</h2>
        <p>
          Users are responsible for ensuring that any data entered is accurate. The developers are not responsible for
          any errors in calculations resulting from incorrect data input.
        </p>
        <br />

        <h2 style={{ fontWeight: "bold" }}>Data and Privacy</h2>
        <p>
          Any information provided is stored anonymously if stored at all. No personal data is transmitted to external
          servers. Users retain full control over their data and may delete or clear it at any time.
        </p>
        <br />

        <h2 style={{ fontWeight: "bold" }}>Prohibited Use</h2>
        <p>
          You may not use this application for any unlawful purpose or in any manner that could damage, disable, or
          impair the application. Unauthorized access or attempts to bypass security features are strictly prohibited.
        </p>
        <br />

        <h2 style={{ fontWeight: "bold" }}>Limitation of Liability</h2>
        <p>
          The developers make no warranties regarding the accuracy or reliability of the application. In no event shall
          the developers be liable for any damages arising from the use or inability to use this application.
        </p>
        <br />

        <h2 style={{ fontWeight: "bold" }}>Updates to Terms</h2>
        <p>
          These Terms of Service may be updated periodically. Users are encouraged to review this page regularly to stay
          informed about the current terms.
        </p>
        <p style={{ marginTop: "1rem", textAlign: "center", fontStyle: "italic" }}>Last Updated: December 1st, 2025</p>
        <br></br>
        <p style={{ textAlign: "center", fontWeight: "bold" }}>
          Thank you for using WATsMyGpa. By continuing, you agree to abide by these terms.
        </p>
      </div>
    </div>
  )
}

export default TermsPage
