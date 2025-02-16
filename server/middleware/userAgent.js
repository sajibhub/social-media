const UserAgentMiddleware = (req, res, next) => {
  const domain = req.get("origin");
  const router = req.originalUrl.split("?")[0];
  const allowedDomains = process.env.FRONTEND_URLS.split(',');

  const isPassportAuthEndpoint = ["/api/v1/user/auth/google", "/api/v1/user/auth/google/callback",
    "/api/v1/user/auth/github", "/api/v1/user/auth/github/callback", "/api/v1/user/auth/facebook", "/api/v1/user/auth/facebook/callback"
  ]
  if (!isPassportAuthEndpoint.includes(router)) {
    if (!allowedDomains.includes(domain)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
  }


  const userAgent = req.headers["user-agent"];
  if (!userAgent) {
    return res.status(400).json({
      message: "access denied",
    });
  }

  const browserKeywords = [
    "Mozilla",
    "Chrome",
    "Safari",
    "Opera",
    "Edg",
    "MSIE",
    "Trident",
    "Brave",
    "Vivaldi",
    "UCBrowser",
    "Maxthon",
    "YaBrowser",
    "PostmanRuntime/7.43.0",
  ];

  const isBrowser = browserKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  if (!isBrowser) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

export default UserAgentMiddleware;
