import { useEffect, useState } from "react";

const BETA_LAUNCH_AT = "2026-04-11T09:00:00+02:00";

type CountdownUnit = {
  label: string;
  value: number;
};

function getCountdownUnits(targetTime: number, currentTime: number): CountdownUnit[] {
  const remainingMs = Math.max(targetTime - currentTime, 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "Jours", value: days },
    { label: "Heures", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Secondes", value: seconds },
  ];
}

function formatUnitValue(value: number) {
  return value.toString().padStart(2, "0");
}

export function BetaLaunchBanner() {
  const targetTime = new Date(BETA_LAUNCH_AT).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const countdownUnits = getCountdownUnits(targetTime, now);
  const isLive = now >= targetTime;

  return (
    <section className="beta-banner" aria-label="Informations de lancement beta">
      <div className="beta-banner__copy">
        <span className="beta-banner__eyebrow">Projet en beta</span>
        <div className="beta-banner__text">
          <strong>Ouverture publique prevue le 11 avril 2026.</strong>
          <p>
            {isLive
              ? "La plateforme est officiellement ouverte. Merci de verifier les derniers parcours avant communication large."
              : "Les premiers retours sont en cours de collecte avant l'ouverture officielle."}
          </p>
        </div>
      </div>

      <div className="beta-banner__countdown" aria-live="polite">
        {countdownUnits.map((unit) => (
          <article key={unit.label} className="beta-banner__unit">
            <strong>{formatUnitValue(unit.value)}</strong>
            <span>{unit.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
