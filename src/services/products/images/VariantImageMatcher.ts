export interface VariantImageCandidate {
  caminho: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function sanitize(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.trim();
}

function stripQueryAndHash(value: string): string {
  return value.split("?")[0].split("#")[0];
}

function extractPathSegment(value: string): string {
  const sanitized = stripQueryAndHash(sanitize(value));

  if (!sanitized) {
    return "";
  }

  try {
    const parsed = new URL(sanitized);
    const pathname = parsed.pathname.trim();
    const segment = pathname.split(/[\\/]/).filter(Boolean).pop() ?? "";
    return segment.trim();
  } catch {
    const segment = sanitized.split(/[\\/]/).filter(Boolean).pop() ?? sanitized;
    return segment.trim();
  }
}

export class VariantImageMatcher {
  static extractFilename(value: string | null | undefined): string {
    return extractPathSegment(value ?? "");
  }

  match<T extends VariantImageCandidate>(variationImage: string | null, productImages: T[]): T | null {
    if (!variationImage) {
      return null;
    }

    const variationFilename = normalize(VariantImageMatcher.extractFilename(variationImage));

    if (!variationFilename) {
      return null;
    }

    return (
      productImages.find((image) => {
        const productFilename = normalize(VariantImageMatcher.extractFilename(image.caminho));
        return productFilename === variationFilename;
      }) ?? null
    );
  }
}

export const variantImageMatcher = new VariantImageMatcher();