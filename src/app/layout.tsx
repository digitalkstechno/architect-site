import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "../styles/globals.css";
import ClientLayout from "@/components/ClientLayout";
import { AuthProvider } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";
import { ProjectsProvider } from "@/lib/projects-store";
import { TasksProvider } from "@/lib/tasks-store";
import { OfficeTasksProvider } from "@/lib/office-tasks-store";
import { SiteTasksProvider } from "@/lib/site-tasks-store";
import { SiteUpdatesProvider } from "@/lib/site-updates-store";
import { PaymentsProvider } from "@/lib/payments-store";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArchiSite | Director Construction Management",
  description: "Modern SaaS dashboard for directors and site management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        <RoleProvider>
          <AuthProvider>
            <ProjectsProvider>
              <TasksProvider>
                <OfficeTasksProvider>
                  <SiteTasksProvider>
                    <SiteUpdatesProvider>
                      <PaymentsProvider>
                        <ClientLayout>{children}</ClientLayout>
                        <Toaster position="top-right" />
                      </PaymentsProvider>
                    </SiteUpdatesProvider>
                  </SiteTasksProvider>
                </OfficeTasksProvider>
              </TasksProvider>
            </ProjectsProvider>
          </AuthProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
