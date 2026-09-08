import {brand} from '../../../config/brand';
import {features} from '../../../config/features';
import {navigation} from '../../../config/navigation';
import {seo} from '../../../config/seo';
import {sections} from '../../../config/sections';
import {tokens} from '../../../config/tokens';
import {market} from '../../../config/market';
import {SECTION_TYPES, type SectionType} from '../sections/types';
import {
  ConfigError,
  bool,
  color,
  int,
  oneOf,
  optional,
  required,
  str,
  url,
} from './schema';

export type ValidatedConfig = {
  brand: {
    name: string;
    tagline: string;
    logo: string;
    publicHost: string;
    contact: {email: string; phone: string; whatsapp: string};
    social: {instagram: string; tiktok: string; facebook: string; youtube: string};
  };
  tokens: typeof tokens;
  navigation: typeof navigation;
  features: {[K in keyof typeof features]: boolean};
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultShareImage: string;
    twitterHandle: string;
  };
  sections: Array<{type: SectionType; props: Record<string, unknown>}>;
  market: {country: string; language: string};
};

/** Shopify market codes are two uppercase letters; a lowercase code is rejected by the API. */
function code(key: string, value: unknown, length: number): string {
  const s = required(key, value);
  if (s.length !== length || s !== s.toUpperCase()) {
    throw new ConfigError(key, `${length} uppercase letters`, value);
  }
  return s;
}

function validateTokens() {
  for (const [name, value] of Object.entries(tokens.color)) {
    color(`tokens.color.${name}`, value);
  }
  // Accent is the one color allowed to be empty: it falls back to `action`.
  for (const [name, value] of Object.entries(tokens.color)) {
    if (name !== 'accent' && value === '') {
      throw new ConfigError(`tokens.color.${name}`, 'a hex color', value);
    }
  }
  for (const [name, value] of Object.entries(tokens.font)) {
    required(`tokens.font.${name}`, value);
  }
  int('tokens.layout.gridColumns', tokens.layout.gridColumns, 2, 6);
  required('tokens.layout.maxWidth', tokens.layout.maxWidth);
  return tokens;
}

function validateSections() {
  return sections.map((section, index) => {
    const key = `sections[${index}].type`;
    const type = oneOf(key, section.type, SECTION_TYPES);
    if (!section.props || typeof section.props !== 'object') {
      throw new ConfigError(`sections[${index}].props`, 'an object', section.props);
    }
    return {type, props: section.props as Record<string, unknown>};
  });
}

function validateNavigation() {
  const check = (label: string, links: readonly {label: string; href: string}[]) =>
    links.forEach((link, i) => {
      required(`${label}[${i}].label`, link.label);
      const href = required(`${label}[${i}].href`, link.href);
      if (href.includes('/collections/all')) {
        throw new ConfigError(
          `${label}[${i}].href`,
          'a collection handle that exists; the "all" handle returns 404 on stores that do not define it',
          href,
        );
      }
    });
  check('navigation.header', navigation.header);
  navigation.footer.forEach((group, i) => {
    required(`navigation.footer[${i}].title`, group.title);
    check(`navigation.footer[${i}].links`, group.links);
  });
  return navigation;
}

export function validateConfig(): ValidatedConfig {
  const validatedFeatures = Object.fromEntries(
    Object.entries(features).map(([name, value]) => [
      name,
      bool(`features.${name}`, value),
    ]),
  ) as ValidatedConfig['features'];

  const titleTemplate = required('seo.titleTemplate', seo.titleTemplate);
  if (!titleTemplate.includes('%s')) {
    throw new ConfigError('seo.titleTemplate', 'a template containing "%s"', titleTemplate);
  }

  return {
    brand: {
      name: required('brand.name', brand.name),
      tagline: optional('brand.tagline', brand.tagline),
      logo: required('brand.logo', brand.logo),
      publicHost: url('brand.publicHost', brand.publicHost),
      contact: {
        email: optional('brand.contact.email', brand.contact.email),
        phone: optional('brand.contact.phone', brand.contact.phone),
        whatsapp: optional('brand.contact.whatsapp', brand.contact.whatsapp),
      },
      social: {
        instagram: optional('brand.social.instagram', brand.social.instagram),
        tiktok: optional('brand.social.tiktok', brand.social.tiktok),
        facebook: optional('brand.social.facebook', brand.social.facebook),
        youtube: optional('brand.social.youtube', brand.social.youtube),
      },
    },
    tokens: validateTokens(),
    navigation: validateNavigation(),
    features: validatedFeatures,
    seo: {
      titleTemplate,
      defaultTitle: required('seo.defaultTitle', seo.defaultTitle),
      defaultDescription: required('seo.defaultDescription', seo.defaultDescription),
      defaultShareImage: required('seo.defaultShareImage', seo.defaultShareImage),
      twitterHandle: optional('seo.twitterHandle', seo.twitterHandle),
    },
    sections: validateSections(),
    market: {
      country: code('market.country', market.country, 2),
      language: code('market.language', market.language, 2),
    },
  };
}

/** Environment keys the storefront cannot serve without. Names only; values are never logged. */
const REQUIRED_ENV = ['SESSION_SECRET', 'PUBLIC_STORE_DOMAIN'] as const;

export function validateEnv(env: Record<string, unknown>) {
  const missing = REQUIRED_ENV.filter(
    (key) => typeof env[key] !== 'string' || String(env[key]).trim() === '',
  );
  if (missing.length > 0) {
    throw new ConfigError(
      `env.${missing.join(', env.')}`,
      'a non-empty value supplied by the environment',
      undefined,
    );
  }
  str('env.PUBLIC_STORE_DOMAIN', env.PUBLIC_STORE_DOMAIN);
}
