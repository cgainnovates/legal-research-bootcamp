export function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "The requested endpoint was not found.",
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error("[api-error]", err);
  }

  const hide =
    status === 500 &&
    process.env.NODE_ENV === "production" &&
    !err.expose;

  res.status(status).json({
    success: false,
    message: hide
      ? "An unexpected server error occurred. Please try again."
      : err.message || "Request failed.",
  });
}
