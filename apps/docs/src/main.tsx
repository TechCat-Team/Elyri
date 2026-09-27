import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { I18nProvider } from './lib/i18n';

import 'elyri/styles.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/content.css';
import './styles/playground.css';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}
