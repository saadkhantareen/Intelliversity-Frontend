// src/utils/errors.js

/**
 * DRF errors arrive in many shapes. This flattens all of them into one
 * readable sentence, and keeps the field name when there is one.
 */
export function getErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);

  const parts = [];
  for (const [key, value] of Object.entries(data)) {
    const text = flatten(value);
    if (!text) continue;
    parts.push(key === "non_field_errors" || key === "detail" ? text : `${key}: ${text}`);
    if (parts.length >= 3) break;
  }
  return parts.length ? parts.join(" | ") : fallback;
}

function flatten(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.detail) return String(value.detail);
    if (value.message) return String(value.message);
    return Object.entries(value)
      .map(([k, v]) => `${k} ${flatten(v)}`)
      .join(", ");
  }
  return "";
}
