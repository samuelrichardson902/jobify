import "./globals.css";
import { SupabaseAuthProvider } from "../components/SupabaseAuthProvider";

export const metadata = {
  title: "Jobify",
  description: "Track your job applications with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="jobifyTheme">
      <body>
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  );
}
