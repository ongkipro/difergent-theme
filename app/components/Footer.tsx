import {Link} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {config} from '~/lib/config';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Footer structure comes from configuration, not from a Shopify menu, so a
 * derived store changes it without touching a component. Empty contact and
 * social values are omitted rather than rendered as dead links.
 */
export function Footer({header}: FooterProps) {
  const shopName = header?.shop?.name || config.brand.name;
  const socials = Object.entries(config.brand.social).filter(([, href]) => href);
  const {email, phone, whatsapp} = config.brand.contact;

  return (
    <footer className="mt-[var(--df-space-16)] border-t border-[color:var(--df-color-hairline)] bg-[color:var(--df-color-canvas)]">
      <div className="container-page grid gap-[var(--df-space-8)] py-[var(--df-space-12)] md:grid-cols-4">
        <div>
          <p className="font-[family-name:var(--df-font-display)] text-[length:var(--df-size-xl)] text-[color:var(--df-color-ink-strong)]">
            {shopName}
          </p>
          {config.brand.tagline ? (
            <p className="mt-[var(--df-space-2)] max-w-[32ch] text-[length:var(--df-size-sm)] text-[color:var(--df-color-ink-muted)]">
              {config.brand.tagline}
            </p>
          ) : null}
        </div>

        {config.navigation.footer.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">
              {group.title}
            </h2>
            <ul className="mt-[var(--df-space-3)] space-y-[var(--df-space-1)]">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    prefetch="intent"
                    className="touch-target inline-flex items-center text-[length:var(--df-size-sm)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {email || phone || whatsapp || socials.length > 0 ? (
          <div>
            <h2 className="font-[family-name:var(--df-font-body)] text-[length:var(--df-size-sm)] uppercase tracking-wide text-[color:var(--df-color-ink-muted)]">
              Contact
            </h2>
            <ul className="mt-[var(--df-space-3)] space-y-[var(--df-space-1)] text-[length:var(--df-size-sm)]">
              {email ? (
                <li>
                  <a className="touch-target inline-flex items-center" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a className="touch-target inline-flex items-center" href={`tel:${phone}`}>
                    {phone}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a
                    className="touch-target inline-flex items-center"
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {socials.map(([name, href]) => (
                <li key={name}>
                  <a className="touch-target inline-flex items-center capitalize" href={href} rel="noreferrer">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="container-page border-t border-[color:var(--df-color-hairline)] py-[var(--df-space-4)] text-[length:var(--df-size-xs)] text-[color:var(--df-color-ink-muted)]">
        &copy; {new Date().getFullYear()} {shopName}
      </div>
    </footer>
  );
}
