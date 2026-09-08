import {useEffect, useState} from 'react';
import {useAnalytics, useNonce} from '@shopify/hydrogen';
import {tracking} from '../../config/tracking';

/**
 * The single consent gate for marketing tags. A tag is injected once, and only
 * after the buyer has granted the category it declares. Nothing ships enabled,
 * so a store opts in by adding an entry to config/tracking.ts rather than by
 * editing a component.
 *
 * Consent is read from the analytics provider, which already owns the Customer
 * Privacy configuration; re-initialising it here would be a second source of
 * truth for the same decision.
 */
export function MarketingTags() {
  const nonce = useNonce();
  const {customerPrivacy, canTrack} = useAnalytics();
  const [injected, setInjected] = useState<string[]>([]);
  const [consentRevision, setConsentRevision] = useState(0);

  // Consent is collected after the page has rendered. Without listening for
  // that, a visitor who accepts would not get their tags until the next
  // navigation, which quietly loses the measurement they just agreed to.
  useEffect(() => {
    const bump = () => setConsentRevision((n) => n + 1);
    document.addEventListener('visitorConsentCollected', bump);
    window.addEventListener('visitorConsentCollected', bump);
    return () => {
      document.removeEventListener('visitorConsentCollected', bump);
      window.removeEventListener('visitorConsentCollected', bump);
    };
  }, []);

  useEffect(() => {
    if (tracking.tags.length === 0) return;

    const allowed = (category: 'analytics' | 'marketing'): boolean => {
      if (!customerPrivacy) return false;

      if (tracking.requireExplicitConsent) {
        // The declared type is `boolean | undefined`, but the browser API also
        // returns strings: '' while the visitor has not decided, and 'yes' or
        // 'no' once they have. Checking `=== true` alone would silently keep
        // every tag off forever on a real store, so accept both shapes and
        // treat anything else, including the empty string, as undecided.
        const current = customerPrivacy.currentVisitorConsent?.() as
          | Record<string, unknown>
          | undefined;
        const value = current?.[category];
        return value === true || value === 'yes';
      }

      return category === 'analytics'
        ? Boolean(customerPrivacy.analyticsProcessingAllowed?.())
        : Boolean(customerPrivacy.marketingAllowed?.());
    };

    const added: string[] = [];
    for (const tag of tracking.tags) {
      if (!canTrack() || !allowed(tag.consent)) continue;
      const domId = `df-tag-${tag.id}`;
      if (document.getElementById(domId)) continue;

      const script = document.createElement('script');
      script.id = domId;
      script.src = tag.src;
      script.async = tag.async ?? true;
      if (nonce) script.nonce = nonce;
      document.head.appendChild(script);
      added.push(tag.id);
    }
    if (added.length > 0) setInjected((prev) => [...prev, ...added]);
  }, [canTrack, customerPrivacy, nonce, injected.length, consentRevision]);

  return null;
}
