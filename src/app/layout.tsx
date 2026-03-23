import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ClientLayout from "@/components/ClientLayout";
import { AuthProvider } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { ProjectsProvider } from "@/lib/projects-store";
import { TasksProvider } from "@/lib/tasks-store";
import { SiteUpdatesProvider } from "@/lib/site-updates-store";
import { FinanceProvider } from "@/lib/finance-store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArchiSite | Architect Construction Management",
  description: "Modern SaaS dashboard for architects and site management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        <RoleProvider>
          <AuthProvider>
            <ProjectsProvider>
              <TasksProvider>
                <SiteUpdatesProvider>
                  <FinanceProvider>
                    <ClientLayout>{children}</ClientLayout>
                    <ToastContainer position="top-right" autoClose={3000} />
                  </FinanceProvider>
                </SiteUpdatesProvider>
              </TasksProvider>
            </ProjectsProvider>
          </AuthProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
