/**
 * 界面层入口：把 React 挂到 index.html 的 #root 上。
 */

import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}
