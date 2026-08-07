import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginGate from './components/auth/LoginGate.jsx';
import GreenhouseScene from './components/layout/GreenhouseScene.jsx';
import SkincareBoxModal from './components/modals/SkincareBoxModal.jsx';
import CosmeticsBoxModal from './components/modals/CosmeticsBoxModal.jsx';
import NoticeBoardModal from './components/modals/NoticeBoardModal.jsx';
import BookshelfModal from './components/modals/BookshelfModal.jsx';
import StarScrollModal from './components/modals/StarScrollModal.jsx';
import TradeMarketModal from './components/modals/TradeMarketModal.jsx';

function GuildHall() {
  const [openModal, setOpenModal] = useState(null);

  return (
    <>
      <GreenhouseScene onOpenModal={setOpenModal} />

      {openModal === 'skincare' && <SkincareBoxModal onClose={() => setOpenModal(null)} />}
      {openModal === 'cosmetics' && <CosmeticsBoxModal onClose={() => setOpenModal(null)} />}
      {openModal === 'notice' && <NoticeBoardModal onClose={() => setOpenModal(null)} />}
      {openModal === 'bookshelf' && <BookshelfModal onClose={() => setOpenModal(null)} />}
      {openModal === 'starScroll' && <StarScrollModal onClose={() => setOpenModal(null)} />}
      {openModal === 'trademarket' && <TradeMarketModal onClose={() => setOpenModal(null)} />}
    </>
  );
}

function AppShell() {
  const { status } = useAuth();

  if (status === 'checking') {
    return <div className="app-loading">開門中…</div>;
  }
  if (status === 'loggedOut') {
    return <LoginGate />;
  }
  return <GuildHall />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
