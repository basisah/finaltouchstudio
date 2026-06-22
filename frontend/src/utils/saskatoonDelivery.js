const SASKATOON_FSAS = new Set([
  "S7H", "S7J", "S7K", "S7L", "S7M", "S7N",
  "S7P", "S7R", "S7S", "S7T", "S7V", "S7W",
]);

const CANADIAN_POSTAL_REGEX = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;

export function normalizePostalCode(code) {
  return (code || "").replace(/\s+/g, "").toUpperCase();
}

export function formatPostalCodeInput(value) {
  const raw = (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  let result = "";

  for (let i = 0; i < raw.length && i < 6; i++) {
    const char = raw[i];
    const expectLetter = i % 2 === 0;
    const isLetter = /[A-Z]/.test(char);
    const isDigit = /[0-9]/.test(char);

    if (expectLetter && isLetter) result += char;
    else if (!expectLetter && isDigit) result += char;
  }

  // Restrict to Saskatoon FSAs (S7H, S7J, S7K, …)
  if (result.length >= 1 && result[0] !== "S") result = "";
  if (result.length >= 2 && result[1] !== "7") result = result.slice(0, 1);
  if (result.length >= 3) {
    const fsa = result.slice(0, 3);
    if (!SASKATOON_FSAS.has(fsa)) result = result.slice(0, 2);
  }

  if (result.length <= 3) return result;
  return `${result.slice(0, 3)} ${result.slice(3)}`;
}

export function isValidCanadianPostalFormat(code) {
  return CANADIAN_POSTAL_REGEX.test(normalizePostalCode(code));
}

export function getPostalCodeFsa(code) {
  return normalizePostalCode(code).slice(0, 3);
}

export function isSaskatoonPostalCode(code) {
  const fsa = getPostalCodeFsa(code);
  if (fsa.length < 3) return null;
  return SASKATOON_FSAS.has(fsa);
}

export function getFormatValidationMessage(code) {
  const normalized = normalizePostalCode(code);
  if (!normalized) return null;
  if (normalized.length < 6) {
    return "Enter a complete postal code (e.g. S7K 3Y5).";
  }
  if (!isValidCanadianPostalFormat(code)) {
    return "Use a valid Canadian postal code format (e.g. S7K 3Y5).";
  }
  return null;
}

export function getDeliveryStatus(code) {
  const normalized = normalizePostalCode(code);

  if (!normalized) {
    return { status: "empty", message: "Enter your postal code to check delivery." };
  }
  if (normalized.length < 6) {
    return { status: "incomplete", message: "Enter your full postal code (e.g. S7K 3Y5)." };
  }
  if (!isValidCanadianPostalFormat(code)) {
    return { status: "invalid", message: "Use a valid Canadian postal code format (e.g. S7K 3Y5)." };
  }

  const inArea = isSaskatoonPostalCode(code);
  if (inArea === false) {
    return { status: "unavailable" };
  }

  return { status: "available" };
}

export function isDeliveryAllowed(code) {
  return getDeliveryStatus(code).status === "available";
}

export function checkDeliveryAvailability(code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = normalizePostalCode(code);

      if (!isValidCanadianPostalFormat(code)) {
        resolve({
          status: "invalid",
          title: "Invalid postal code",
          message: "Use a valid Canadian postal code format (e.g. S7K 3Y5).",
        });
        return;
      }

      if (!SASKATOON_FSAS.has(normalized.slice(0, 3))) {
        resolve({
          status: "unavailable",
          title: "Delivery is not available to this postal code",
          message: "Please choose Store Pickup instead.",
        });
        return;
      }

      resolve({
        status: "available",
        title: "Delivery available to your area",
        message: "Estimated delivery: 2–5 business days",
      });
    }, 700);
  });
}
