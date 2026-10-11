import QRCode from "qrcode";

/**
 * Renders an `otpauth://` URI as an inline SVG string for authenticator-app
 * enrollment. Server-only so the QR encoder never enters the client bundle.
 */
export async function totpQrSvg(uri: string): Promise<string> {
  return QRCode.toString(uri, {
    type: "svg",
    margin: 1,
    width: 192,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Extracts the base32 secret from an `otpauth://totp/...` URI so it can be
 * shown for manual entry when a QR cannot be scanned.
 */
export function totpSecretFromUri(uri: string): string {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}
