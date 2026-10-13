import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAppShield } from './utils/appShield.ts';

// Activate application anti-theft & anti-inspection shield
initAppShield();

createRoot(document.getElementById('root')!).render(<App />);
