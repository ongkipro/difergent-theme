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
/**
 * Three surfaces, three shapes, because they answer different questions.
 *
 * - `sheet` rises from the bottom edge. It is where a thumb already is, so the
 *   mobile menu uses it.
 * - `drawer` is a bottom sheet on a phone and a right-hand panel from `sm`. The
 *   cart is a working surface: on a narrow screen it belongs under the thumb,
 *   on a wide one it belongs beside the page it was opened from.
 * - `modal` is a centred panel near the top. Search is a question, not a place,
 *   so it sits over the page rather than beside it and returns you where you
 *   were.
 */
export type AsideVariant = 'drawer' | 'sheet' | 'modal';

const PANEL: Record<AsideVariant, string> = {
  sheet:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--df-radius-lg)]',
  drawer:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--df-radius-lg)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:h-full sm:w-full sm:max-w-[420px] sm:rounded-none',
  modal:
    'inset-x-[var(--df-space-4)] top-[max(1rem,6vh)] mx-auto max-h-[80vh] max-w-[640px] rounded-[var(--df-radius-lg)]',
};

const CLOSED: Record<AsideVariant, string> = {
  sheet: 'translate-y-full',
  drawer: 'translate-y-full sm:translate-y-0 sm:translate-x-full',
  modal: '-translate-y-3 scale-[0.98] opacity-0',
};

const OPEN: Record<AsideVariant, string> = {
  sheet: 'translate-y-0',
  drawer: 'translate-y-0 sm:translate-x-0',
  modal: 'translate-y-0 scale-100 opacity-100',
};

export function Aside({
  children,
  heading,
  type,
  variant = 'drawer',
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  variant?: AsideVariant;
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

      // Move focus into the panel so a keyboard or screen reader user lands
      // where the content is, not back at the top of the page behind it.
      const panel = document.getElementById(`aside-panel-${id}`);
      // Focus the input when the surface is built around one, otherwise focus
      // the panel itself. Focusing the first link instead paints a focus ring on
      // a menu item that nobody chose, which reads as a bug to a pointer user
      // while helping no one.
      const target =
        panel?.querySelector<HTMLElement>('input:not([type="hidden"])') ?? panel;
      window.setTimeout(() => target?.focus?.(), 60);
    }
    return () => abortController.abort();
  }, [close, expanded, id]);

  return (
    <div
      aria-modal
      role="dialog"
      aria-labelledby={id}
      aria-hidden={!expanded}
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

      <div
        id={`aside-panel-${id}`}
        tabIndex={-1}
        className={`absolute flex flex-col overflow-hidden bg-[color:var(--df-color-surface)] shadow-[var(--df-shadow-overlay)] transition-transform duration-[var(--df-motion-overlay)] motion-reduce:transition-none ${
          PANEL[variant]
        } ${expanded ? OPEN[variant] : CLOSED[variant]}`}
      >
        {variant === 'modal' ? null : (
          // A grabber reads as "this pulls up from the edge" before anyone
          // touches it. It is decoration for the eye, not a control.
          <div
            aria-hidden
            className="mx-auto mt-[var(--df-space-2)] h-1 w-10 shrink-0 rounded-[var(--df-radius-pill)] bg-[color:var(--df-color-border)] sm:hidden"
          />
        )}

        <header className="flex shrink-0 items-center justify-between border-b border-[color:var(--df-color-hairline)] px-[var(--df-space-4)] py-[var(--df-space-3)]">
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
      </div>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  // Cmd+K and Ctrl+K open search from anywhere, the shortcut people already
  // expect. It is an addition to the visible control, never a replacement.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setType((current) => (current === 'search' ? 'closed' : 'search'));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
