/**
 * @param {string} path
 * @returns {RegExp}
 */
export function pathToRegex(path) {
  const pattern = path.replace(/\//g, "\\/").replace(/:\w+/g, "([^/]+)");

  return new RegExp(`^${pattern}$`);
}

/**
 * @param {string} routePath
 * @param {string} actualPath
 * @returns {Record<string, string>}
 */
export function extractParams(routePath, actualPath) {
  const paramNames = [];
  const paramMatches = routePath.matchAll(/:(\w+)/g);
  for (const match of paramMatches) {
    paramNames.push(match[1]);
  }

  if (paramNames.length === 0) {
    return {};
  }

  const pattern = pathToRegex(routePath);
  const match = actualPath.match(pattern);

  if (!match) {
    return {};
  }

  /** @type {Record<string, string>} */
  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return params;
}
