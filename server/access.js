export function requireBasicAuth(request, response, next) {
  const username = process.env.ACCESS_USERNAME;
  const password = process.env.ACCESS_PASSWORD;

  // Local development remains simple unless the developer deliberately adds
  // these two optional variables to their local .env file.
  if (!username || !password) return next();

  const header = request.get('authorization');
  if (header?.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const divider = decoded.indexOf(':');
      if (divider >= 0 && decoded.slice(0, divider) === username && decoded.slice(divider + 1) === password) return next();
    } catch {
      // Invalid credentials use the same response as absent credentials.
    }
  }

  response.set('WWW-Authenticate', 'Basic realm="BandSet"');
  return response.status(401).json({ error: 'Authentication required.' });
}
