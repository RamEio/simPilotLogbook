import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }, ...items];

  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-caption text-ink-muted">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-ink-disabled"
                  strokeWidth={1.5}
                  aria-hidden
                />
              ) : null}
              <li className="min-w-0">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-ink-secondary transition-colors hover:text-ink-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-ink-primary" : undefined}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
