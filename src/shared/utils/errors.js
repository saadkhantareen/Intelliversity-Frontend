export function getErrorMessage(err, fallback = "An unexpected error occurred.") {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const data = err.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);
    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(" ")
        : String(data.non_field_errors);
    }
    if (typeof data === "object") {
      const parts = [];
      for (const [key, val] of Object.entries(data)) {
        const fieldName = key.replace(/_/g, " ");
        const text = Array.isArray(val) ? val.join(", ") : String(val);
        parts.push(`${fieldName}: ${text}`);
      }
      if (parts.length) return parts.join(" | ");
    }
  }

  if (err.message) return err.message;
  return fallback;
}