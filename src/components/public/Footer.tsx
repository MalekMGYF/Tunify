import Link from "next/link";
import { GitFork, AtSign, MessageCircle } from "lucide-react";
import { LEGAL_LINKS, NAV_LINKS } from "@/config/app";

export default function Footer({
  appName,
  description,
  socialTwitter,
  socialGithub,
  socialDiscord,
}: {
  appName: string;
  description: string;
  socialTwitter: string;
  socialGithub: string;
  socialDiscord: string;
}) {
  const socialLinks = [
    { key: "twitter", href: socialTwitter, label: "Twitter", Icon: AtSign },
    { key: "github", href: socialGithub, label: "GitHub", Icon: GitFork },
    { key: "discord", href: socialDiscord, label: "Discord", Icon: MessageCircle },
  ].filter((link) => link.href);

  return (
    <footer className="border-t border-white/8 py-14">
      <div className="container-page">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/#home" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-7 w-7" />
              <span className="font-display text-base font-semibold">{appName}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-400">{description}</p>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socialLinks.map(({ key, href, label, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-mist-300 transition-colors hover:border-white/25 hover:text-mist-100"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-mist-100">Navigation</h3>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-mist-400 hover:text-mist-100">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/api/releases/latest/download" className="text-sm text-mist-400 hover:text-mist-100">
                  Download
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-mist-100">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={LEGAL_LINKS.privacyPolicy} className="text-sm text-mist-400 hover:text-mist-100">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={LEGAL_LINKS.termsOfService} className="text-sm text-mist-400 hover:text-mist-100">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/8 pt-6">
          <p className="text-xs text-mist-400">© {new Date().getFullYear()} {appName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
