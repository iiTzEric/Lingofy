import { LANGUAGE_TO_FLAG } from "../constants";

export function getLanguageFlag(language) {
  if (Array.isArray(language)) {
    return language.map((item, index) => {
      const flag = getLanguageFlag(item);
      return flag ? <span key={`${item}-${index}`}>{flag}</span> : null;
    });
  }

  if (typeof language !== "string") return null;
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }

  return null;
}