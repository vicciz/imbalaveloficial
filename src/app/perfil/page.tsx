'use client';
import ProfilePage from '@/src/app/perfil/Layout/ProfilePage';
import { useHeaderUser } from '@/src/hooks/useHeaderUser';

export default function Perfil() {
  const { user, loading, logout } = useHeaderUser();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] p-6 text-slate-700">
        <p>Usuário não logado</p>
      </div>
    );
  }

  return (
    <ProfilePage
      user={{ ...user, email: user.email ?? '' }}
      onLogout={logout}
    />
  );
}
