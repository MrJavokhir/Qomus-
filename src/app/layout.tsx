import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Qomus - Student Legal Club Platform",
    description: "Bilingual platform for student legal club featuring events, resources, and team registrations",
    keywords: ["legal", "student", "club", "education", "uzbekistan"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uz" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <I18nProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </ThemeProvider>
                </I18nProvider>
            </body>
        </html>
    );
}
