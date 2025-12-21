"use client"

import type React from "react"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { useRouter } from "next/navigation"

const PrivacyPage: React.FC = () => {
  const router = useRouter()

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
          <span className="text-foreground">Privacy Policy</span>{" "}
        </h1>
        <br></br>
        <p>
          This application is committed to protecting your privacy. This document explains how any information you
          provide is collected, used, and managed.
        </p>

        <br></br>

        <h2>
          <b>Information Collection</b>
        </h2>
        <p>
          Any information you provide, such as your GPA, program, and year, is entirely optional. You have full control
          over what data you submit. All data is stored anonymously if stored at all.
        </p>

        <br></br>

        <h2>
          <b>Use of Information</b>
        </h2>
        <p>
          All computations, including GPA calculations and peer rankings, are performed locally on your device. No
          personal information is transmitted to external servers, and your data remains private at all times.
        </p>

        <br></br>

        <h2>
          <b>Cookies and Local Storage</b>
        </h2>
        <p>
          This application does not use cookies for tracking purposes. Any local storage is solely used to enhance your
          user experience and is under your control.
        </p>

        <br></br>
        <h2>
          <b>Data Sharing and Security</b>
        </h2>
        <p>
          We do not sell, share, or distribute any information provided by users. All information remains anonymous and
          secure. You may delete or clear any data stored on your device at any time.
        </p>

        <br></br>
        <h2>
          <b>Updates to This Policy</b>
        </h2>
        <p>
          We may update this Privacy Policy periodically to reflect changes in our practices. Users are encouraged to
          review this page regularly to stay informed.
        </p>

        <p style={{ marginTop: "1rem", textAlign: "center", fontStyle: "italic" }}>Last Updated: December 1st, 2025</p>
        <br></br>
        <p style={{ textAlign: "center", fontWeight: "bold" }}>
          Thank you for using WATsMyGpa. Your privacy is our priority.
        </p>
      </div>
    </div>
  )
}

export default PrivacyPage
