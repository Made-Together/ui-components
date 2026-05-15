import Image, { type StaticImageData } from "next/image";

import logoAnthropicDarkSrc from "./_logos/LogoAnthropic.svg";
import logoCocaColaDarkSrc from "./_logos/LogoCocaCola.svg";
import logoHermesDarkSrc from "./_logos/LogoHermes.svg";
import logoHSBCDarkSrc from "./_logos/LogoHSBC.svg";
import logoNVidiaDarkSrc from "./_logos/LogoNVidia.svg";
import logoOktaDarkSrc from "./_logos/LogoOkta.svg";
import logoWashingtonPostDarkSrc from "./_logos/LogoWashingtonPost.svg";
import logoWorkableDarkSrc from "./_logos/LogoWorkable.svg";
import logoAnthropicLightSrc from "./_logos/light/LogoAnthropic.svg";
import logoCocaColaLightSrc from "./_logos/light/LogoCocaCola.svg";
import logoHermesLightSrc from "./_logos/light/LogoHermes.svg";
import logoHSBCLightSrc from "./_logos/light/LogoHSBC.svg";
import logoNVidiaLightSrc from "./_logos/light/LogoNVidia.svg";
import logoOktaLightSrc from "./_logos/light/LogoOkta.svg";
import logoWashingtonPostLightSrc from "./_logos/light/LogoWashingtonPost.svg";
import logoWorkableLightSrc from "./_logos/light/LogoWorkable.svg";

const logoImageClassName = "max-h-full max-w-full object-contain dark:hidden";

const logoImageDarkClassName =
  "hidden max-h-full max-w-full object-contain dark:block";

function createLogo(
  defaultSrc: StaticImageData,
  lightSrc: StaticImageData,
  alt: string,
) {
  return function Logo() {
    return (
      <>
        <Image
          src={defaultSrc}
          alt={alt}
          width={64}
          height={64}
          className={logoImageDarkClassName}
        />
        <Image
          src={lightSrc}
          alt={alt}
          width={64}
          height={64}
          className={logoImageClassName}
        />
      </>
    );
  };
}

const LogoNVidia = createLogo(logoNVidiaDarkSrc, logoNVidiaLightSrc, "NVIDIA");
const LogoHSBC = createLogo(logoHSBCDarkSrc, logoHSBCLightSrc, "HSBC");
const LogoOkta = createLogo(logoOktaDarkSrc, logoOktaLightSrc, "Okta");
const LogoCocaCola = createLogo(
  logoCocaColaDarkSrc,
  logoCocaColaLightSrc,
  "Coca-Cola",
);
const LogoWashingtonPost = createLogo(
  logoWashingtonPostDarkSrc,
  logoWashingtonPostLightSrc,
  "The Washington Post",
);
const LogoHermes = createLogo(logoHermesDarkSrc, logoHermesLightSrc, "Hermès");
const LogoAnthropic = createLogo(
  logoAnthropicDarkSrc,
  logoAnthropicLightSrc,
  "Anthropic",
);
const LogoWorkable = createLogo(
  logoWorkableDarkSrc,
  logoWorkableLightSrc,
  "Workable",
);

export const Logos = [
  LogoNVidia,
  LogoHSBC,
  LogoOkta,
  LogoCocaCola,
  LogoWashingtonPost,
  LogoHermes,
  LogoAnthropic,
  LogoWorkable,
];
