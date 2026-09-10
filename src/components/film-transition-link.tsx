"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { animateView } from "motion";
import { type MouseEvent, type ReactNode } from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

type FilmTransitionLinkProps = {
  href: string;
  slug: string;
  className?: string;
  children: ReactNode;
};

function waitForNavigation(pathname: string): Promise<void> {
  return new Promise((resolve) => {
    const deadline = performance.now() + 3000;

    function check() {
      if (window.location.pathname === pathname || performance.now() >= deadline) {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        return;
      }
      requestAnimationFrame(check);
    }

    check();
  });
}

function shouldUseNativeLink(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function FilmTransitionLink({
  href,
  slug,
  className,
  children,
}: FilmTransitionLinkProps) {
  const router = useRouter();
  const { reducedMotion } = useExperienceQuality();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (shouldUseNativeLink(event) || reducedMotion || typeof document.startViewTransition !== "function") {
      return;
    }

    event.preventDefault();
    const target = new URL(href, window.location.href);
    const selector = `[data-film-transition-media="${CSS.escape(slug)}"]`;

    document.documentElement.dataset.routeTransition = "active";

    void (async () => {
      try {
        await animateView(
          async () => {
            router.push(href);
            await waitForNavigation(target.pathname);
          },
          { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
        )
          .add(selector)
          .class("film-media-transition")
          .old({ opacity: [1, 0.92] }, { duration: 0.2 })
          .new({ opacity: [0.9, 1] }, { duration: 0.28 });

        await new Promise((resolve) => window.setTimeout(resolve, 520));
      } finally {
        delete document.documentElement.dataset.routeTransition;
      }
    })();
  }

  return (
    <Link className={className} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
