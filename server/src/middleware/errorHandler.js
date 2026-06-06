function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(error, req, res, next) {
  const isZodError = error?.name === "ZodError" && Array.isArray(error.issues);
  const statusCode = isZodError ? 400 : res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: isZodError ? "Validation error." : error.message || "Internal server error",
    errors: isZodError ? error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) : undefined,
    details: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}

module.exports = { notFound, errorHandler };
