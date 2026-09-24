export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "The requested endpoint was not found.",
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  const message =
    status >= 500 && isProd
      ? "An unexpected server error occurred. Please try again."
      : err.message || "Request failed.";

  if (status >= 500) {
    console.error("[api-error]", err);
  }

  res.status(status).json({
    success: false,
    message,
  });
}
