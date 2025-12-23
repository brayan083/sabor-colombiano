import DriverGuard from '@/components/DriverGuard';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DriverGuard>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </DriverGuard>
    );
}
