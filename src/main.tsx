import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventList } from './pages/EventList';
import { EventGallery } from './pages/EventGallery';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/:slug" element={<EventGallery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
