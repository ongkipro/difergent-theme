import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useId} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      role="dialog"
      aria-labelledby={id}
      aria-hidden={!expanded}
      // `inert` removes the subtree from the tab order and the accessibility
      // tree together. aria-hidden alone leaves focusable children reachable,
      // which is a keyboard trap in a closed drawer.
      inert={!expanded}
      className={`fixed inset-0 z-50 transition-opacity duration-[var(--df-motion-overlay)] ${
        expanded
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={expanded ? 0 : -1}
        onClick={close}
        className="absolute inset-0 h-full w-full bg-[color:var(--df-color-ink-strong)]/40"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[color:var(--df-color-surface)] shadow-[var(--df-shadow-overlay)] transition-transform duration-[var(--df-motion-overlay)] ${
          expanded ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-[color:var(--df-color-hairline)] px-[var(--df-space-4)] py-[var(--df-space-3)]">
          <h2
            id={id}
            className="font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]"
          >
            {heading}
          </h2>
          <button
            type="button"
            className="touch-target -mr-[var(--df-space-2)] inline-flex items-center justify-center px-[var(--df-space-2)] text-[length:var(--df-size-xl)]"
            onClick={close}
            aria-label="Close"
            tabIndex={expanded ? 0 : -1}
          >
            &times;
          </button>
        </header>
        {/*
          The bottom inset keeps the last control clear of an in-app browser's
          own toolbar, where a fixed element otherwise becomes untappable.
        */}
        <div className="flex-1 overflow-y-auto px-[var(--df-space-4)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[var(--df-space-4)]">
          {children}
        </div>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
