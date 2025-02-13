import jwt, { JwtHeader, JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';

const keyCache: Record<string, string> = {};

class JwtValidator {
  #issuerUrl: string;

  constructor(issuerUrl: string) {
    this.#issuerUrl = issuerUrl;
    console.log('issuerUrl:', `${issuerUrl}jwks/`);
  }

  // Retrieve the signing key from the JWKS cache or fetch it
  private async getSigningKey(kid: string): Promise<string> {
    if (keyCache[kid]) {
      return Promise.resolve(keyCache[kid]); // Return cached key
    }
    const configResponse = await fetch(new URL('.well-known/openid-configuration', this.#issuerUrl));
    if (!configResponse.ok) {
      throw new Error('Failed to fetch OpenID configuration');
    }
    const { jwks_uri: jwksUri } = await configResponse.json();
    const client = jwksClient({
      jwksUri: jwksUri,
      cache: true, // Enable caching
      cacheMaxEntries: 5, // Maximum number of entries to cache
      cacheMaxAge: 10 * 60 * 1000, // Cache expiration (10 minutes)
    });

    return new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) return reject(err);
        const publicKey = key?.getPublicKey();
        if (key && publicKey) {
          keyCache[kid] = publicKey;
          resolve(publicKey);
        } else {
          reject(new Error('No public key found'));
        }
      });
    });
  }

  public async validateToken(token: string, audience?: string): Promise<JwtPayload | string> {
    try {
      const decodedHeader = jwt.decode(token, { complete: true })?.header as JwtHeader;
      if (!decodedHeader?.kid) throw new Error('Token is missing a kid (key ID)');

      const publicKey = await this.getSigningKey(decodedHeader.kid);

      const decodedToken = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        audience,
        issuer: this.#issuerUrl,
      });

      return decodedToken as JwtPayload;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw new Error('Invalid token');
    }
  }
}

class JwtValidators {
  #validators: Record<string, JwtValidator> = {};

  public get(issuerUrl: string): JwtValidator {
    if (!this.#validators[issuerUrl]) {
      this.#validators[issuerUrl] = new JwtValidator(issuerUrl);
    }
    return this.#validators[issuerUrl];
  }
}

export { JwtValidators };
