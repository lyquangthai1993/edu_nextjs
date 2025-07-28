import Link from 'next/link';
import { strapiApi } from '@/libs/StrapiApi';

type NavigationItem = {
  id: number;
  title: string;
  path?: string;
  type: string;
  uiRouterKey?: string;
  related?: {
    documentId: string;
    __type: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
  };
  items?: NavigationItem[];
};

export default async function Navigation() {
  const navigation = await strapiApi.getNavigation('Navigation');

  console.error(
    '>>>>>>>>>>>>START navigation<<<<<<\n',
    JSON.stringify(navigation),
    '\n>>>>>>>>>>>>>>>END navigation<<<<<<<<<<<<<<',
  );

  const generateHref = (item: NavigationItem): string => {
    // Use custom path if provided (but ignore if it's just '/')
    if (item.path && item.path !== '/') {
      return item.path;
    }

    // Handle internal links with related content
    if (item.type === 'INTERNAL' && item.related?.slug) {
      // Use the __type field to determine content type
      if (item.related.__type === 'api::page.page') {
        return `/page/${item.related.slug}`;
      }

      // Check for posts
      if (item.related.__type === 'api::post.post') {
        return `/posts/${item.related.slug}`;
      }

      // Default fallback for other content types
      return `/${item.related.slug}`;
    }

    // External links
    if (item.type === 'EXTERNAL' && item.path) {
      return item.path;
    }

    // Fallback
    return '#';
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const href = generateHref(item);
    const hasChildren = item.items && item.items.length > 0;

    return (
      <li key={item.id} className={`nav-item relative ${hasChildren ? 'group' : ''}`}>
        <Link
          href={href}
          className={`
            ${level === 0
        ? 'border-none text-gray-700 hover:text-gray-900 flex items-center'
        : 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }
          `}
        >
          {item.title}
          {hasChildren && level === 0 && (
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </Link>

        {hasChildren && (
          <ul className={`
            sub-menu
            ${level === 0
            ? 'absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'
            : 'ml-4 mt-1 space-y-1'
          }
          `}
          >
            {item?.items?.map(subItem => renderNavigationItem(subItem, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!navigation || !Array.isArray(navigation)) {
    return null;
  }

  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <ul className="nav-menu flex flex-wrap gap-x-5 text-xl">
        {navigation.map(item => renderNavigationItem(item, 0))}
      </ul>
    </nav>
  );
}
