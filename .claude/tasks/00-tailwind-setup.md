# Task 00: Configuração Escalável do Tailwind CSS

> **Execute esta task antes de qualquer outra.** Uma base de design bem definida
> evita inconsistências visuais e retrabalho nos componentes seguintes.

---

## 1. Definir o Design Token Layer em `styles.css`

Usar a diretiva `@theme` do Tailwind v4 para centralizar todos os tokens de design.
Isso gera as utilities automaticamente (ex: `bg-brand`, `text-brand-foreground`).

```css
/* src/styles.css */
@import "tailwindcss";

@theme {
  /* === Paleta de Cores === */
  --color-brand:          #00b4d8;   /* Azul PIX */
  --color-brand-dark:     #0077b6;
  --color-brand-light:    #90e0ef;

  --color-surface:        #f8fafc;   /* Fundo geral */
  --color-surface-card:   #ffffff;
  --color-border:         #e2e8f0;

  --color-success:        #22c55e;
  --color-error:          #ef4444;
  --color-warning:        #f59e0b;

  /* === Tipografia === */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  /* === Espaçamento === */
  --spacing-page: 1.5rem;    /* padding lateral de página */
  --spacing-card: 2rem;      /* padding interno de cards */

  /* === Bordas === */
  --radius-sm:  0.25rem;
  --radius-md:  0.5rem;
  --radius-lg:  0.75rem;
  --radius-xl:  1rem;

  /* === Sombras === */
  --shadow-card: 0 4px 24px 0 rgb(0 0 0 / 0.08);
}
```

---

## 2. Criar Utility Classes Reutilizáveis com `@utility`

Extrair padrões de UI repetidos em utilities semânticas. Evita duplicar longas
cadeias de classes nos templates Angular.

```css
/* src/styles.css (continuação) */

/* --- Layout --- */
@utility page-wrapper {
  min-height: 100dvh;
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-page);
}

/* --- Card --- */
@utility card {
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-card);
  width: 100%;
  max-width: 480px;
}

/* --- Botão primário --- */
@utility btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-brand);
  color: #fff;
  font-weight: 600;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color 150ms ease, opacity 150ms ease;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* --- Campo de formulário --- */
@utility form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@utility form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: #374151;
}

@utility form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: #111827;
  background-color: #fff;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
  }

  &.ng-invalid.ng-touched {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 15%, transparent);
  }
}

/* --- Mensagem de erro de campo --- */
@utility field-error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* --- Alert de erro global --- */
@utility alert-error {
  padding: 0.75rem 1rem;
  background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* --- Spinner --- */
@utility spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 3. Checklist de execução

- [x] Substituir o conteúdo de `src/styles.css` com os blocos `@theme` e `@utility` acima.
- [x] Verificar que o build compila sem erros (`ng build --configuration=development`).
- [ ] Confirmar que as classes geradas aparecem no DevTools (ex: `bg-brand`, `text-brand`).
- [ ] Documentar qualquer token extra necessário antes de criar componentes.
