export const metadata = {
    title: 'Nasze Staże w Hiszpanii — Erasmus+',
    description: 'Program Erasmus+ · Málaga 2025–2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
        <body>{children}</body>
        </html>
    );
}