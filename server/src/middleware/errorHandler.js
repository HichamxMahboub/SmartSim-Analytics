function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(error, req, res, next) {
  const isZodError = error?.name === "ZodError" && Array.isArray(error.issues);
  const isCastError = error?.name === "CastError";
  const isJsonSyntaxError = error instanceof SyntaxError && "body" in error;
  const isMulterError = error?.name === "MulterError";
  const statusCode =
    error.statusCode ||
    error.status ||
    (isZodError || isCastError || isJsonSyntaxError ? 400 : undefined) ||
    (isMulterError ? 413 : undefined) ||
    (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    message: isZodError
      ? "Validation error."
      : isCastError
        ? "Invalid resource identifier."
        : isJsonSyntaxError
          ? "Invalid JSON body."
          : error.message || "Internal server error",
    errors: isZodError ? error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) : undefined,
    details: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}

module.exports = { notFound, errorHandler };
