import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DayWorkbench } from './DayWorkbench';
import { workbenchSlots } from './slots';
import '../styles/global.css';
import './workbench.css';

const root = document.getElementById('workbench-root');
if (!root) throw new Error('Thiếu điểm gắn developer workbench.');

createRoot(root).render(
  <StrictMode>
    <DayWorkbench slots={workbenchSlots} />
  </StrictMode>,
);
