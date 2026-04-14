"use client";

import Script from "next/script";

export function HcaptchaWidget() {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  if (!siteKey) {
    return (
      <p className="text-sm text-rose-600">
        hCaptcha is not configured (missing NEXT_PUBLIC_HCAPTCHA_SITE_KEY).
      </p>
    );
  }

  return (
    <>
      <Script src="https://js.hcaptcha.com/1/api.js" async defer />
      <div className="h-captcha" data-sitekey={siteKey} />
    </>
  );
}
