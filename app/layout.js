import "./globals.css";
import UserProvider from "@/components/providers/UserProvider";

export const metadata = {
  title: "Interview Dost: an AI interviewer, not a question list",
  description: "Most interview practice gives you questions. Interview Dost gives you an interviewer. Adaptive mock interviews powered by open-weight AI that can run on your own machine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><UserProvider>{children}</UserProvider></body>
    </html>
  );
}
