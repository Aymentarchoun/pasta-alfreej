import React, { useState } from 'react';
import { getAuth } from './adminStore';
import AdminLogin from './AdminLogin';
import AdminApp   from './AdminApp';

export default function AdminMain() {
  const [session, setSession] = useState(() => getAuth());

  if (!session) {
    return <AdminLogin onLogin={s => setSession(s)} />;
  }

  return <AdminApp session={session} onLogout={() => setSession(null)} />;
}
