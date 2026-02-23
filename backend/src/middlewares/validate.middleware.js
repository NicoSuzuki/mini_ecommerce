function isMultipart(req) {
  const ct = req.headers["content-type"] || "";
  return ct.includes("multipart/form-data");
}

exports.validateBody = (schema) => (req, res, next) => {
  if (isMultipart(req) && req.path.includes("/upload")) return next();
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation error",
      details: result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  req.body = result.data;
  next();
};
