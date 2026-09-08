const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_DOMAIN_LABEL = "a valid email address";
export const EMAIL_ERROR_MESSAGE = "Please enter a valid email address";

export const isValidEmail = (email: string): boolean => {
  const normalizedEmail = email.trim().toLowerCase();
  return EMAIL_FORMAT.test(normalizedEmail);
};

/** Open signup: any valid email. Names kept so existing imports compile. */
export const isAllowedUtAustinEmail = isValidEmail;
export const UT_AUSTIN_EMAIL_DOMAIN_LABEL = EMAIL_DOMAIN_LABEL;
export const UT_AUSTIN_EMAIL_ERROR_MESSAGE = EMAIL_ERROR_MESSAGE;
