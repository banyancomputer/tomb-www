import * as jose from 'jose';

/**
 * generateJWT - generates a JWT for the service account
 * @param {*} payload - the payload to sign. Specifies an iss, sub, and aud.
 * @param {*} kid - the kid of the private key
 * @param {*} key - the private key file contents -- formatted as string with \n characters
 * @param {*} algorithm - the algorithm to use
 * @returns
 */
export const generateJWT = async (payload, kid, key, algorithm) => {
	const iat = new Date().getTime() / 1000;
	payload = {
		...payload,
		iat: iat,
		exp: iat + 3600,
	};

	// Generate the signing key
	const privKey = await jose.importPKCS8(key, algorithm);

	// Sign the payload
	const jwt = await new jose.SignJWT(payload)
	.setProtectedHeader({ alg: algorithm, kid: kid })
	.setIssuedAt()
	.setExpirationTime('1h')
	.sign(privKey);
	
	return jwt;
};