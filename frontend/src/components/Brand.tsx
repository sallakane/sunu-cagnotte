import { Link } from "react-router-dom";
import { useState } from "react";

type BrandProps = {
  title: string;
  subtitle: string;
  mark?: string;
  to?: string;
  className?: string;
  hideText?: boolean;
};

const LOGO_CANDIDATES = ["/branding/logo.svg", "/branding/logo.png"];

export function Brand({
  title,
  subtitle,
  mark = "CS",
  to,
  className = "",
  hideText = false,
}: BrandProps) {
  const [logoIndex, setLogoIndex] = useState(0);
  const [hasLogo, setHasLogo] = useState(true);

  const content = (
    <>
      {hasLogo ? (
        <span className="brand__logo-wrap" aria-hidden="true">
          <img
            className="brand__logo"
            src={LOGO_CANDIDATES[logoIndex]}
            alt=""
            onError={() => {
              if (logoIndex < LOGO_CANDIDATES.length - 1) {
                setLogoIndex((current) => current + 1);
                return;
              }

              setHasLogo(false);
            }}
          />
        </span>
      ) : (
        <span className="brand__mark">{mark}</span>
      )}
      {!hideText ? (
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`brand ${className}`.trim()} aria-label={`${title} ${subtitle}`.trim()}>
        {content}
      </Link>
    );
  }

  return <div className={`brand ${className}`.trim()}>{content}</div>;
}
