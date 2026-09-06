import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AdminDashboard from '../../components/command-center/AdminDashboard';
import CommandCenterErrorBoundary from '../../components/command-center/CommandCenterErrorBoundary';
import CommandCenterAuthGate from '../../components/command-center/CommandCenterAuthGate';

export const dynamic = 'force-dynamic';

export default function CommandCenterPage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // Solo disponible para el fundador en entorno local
  if (!isLocal && process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div style={{ backgroundColor: '#12161F', color: '#F9FAFB', minHeight: '100vh', padding: '28px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <CommandCenterErrorBoundary>
        <CommandCenterAuthGate>
          <AdminDashboard />
        </CommandCenterAuthGate>
      </CommandCenterErrorBoundary>
    </div>
  );
}