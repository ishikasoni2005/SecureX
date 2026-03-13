function maskDigitsKeepLast(value, keepLast = 4) {
  const digits = value.replace(/\D/g, "");
  let digitsToMask = Math.max(0, digits.length - keepLast);

  return value
    .split("")
    .map((character) => {
      if (!/\d/.test(character)) {
        return character;
      }

      if (digitsToMask > 0) {
        digitsToMask -= 1;
        return "*";
      }

      return character;
    })
    .join("");
}

export function maskSensitivePreview(text) {
  let maskedText = text;

  maskedText = maskedText.replace(
    /((?:otp|one time password|one-time password|verification code|passcode)\D{0,10})(\d{4,8})/gi,
    (_match, prefix, digits) => `${prefix}${"*".repeat(digits.length)}`
  );

  maskedText = maskedText.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, (value) =>
    maskDigitsKeepLast(value, 4)
  );

  maskedText = maskedText.replace(/\b(?:\d[ -]?){13,19}\b/g, (value) =>
    maskDigitsKeepLast(value, 4)
  );

  maskedText = maskedText.replace(
    /\b(?:bank(?:\s+account)?|a\/c|acct|account(?:\s+number)?)\D{0,12}(\d[\d -]{6,20}\d)/gi,
    (fullMatch, accountValue) => fullMatch.replace(accountValue, maskDigitsKeepLast(accountValue, 4))
  );

  return maskedText;
}
