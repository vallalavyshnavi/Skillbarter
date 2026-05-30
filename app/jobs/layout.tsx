import { AuthProvider } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';

export default function FeatureLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl section-padding py-8">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
