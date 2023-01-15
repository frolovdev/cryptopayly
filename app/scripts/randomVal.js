const { randomBytes } = require('crypto');

function generateRandomString(length) {
  const bytes = new Uint8Array(length);
  const result = [];
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';

  const random = randomBytes(32);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < random.length; i++) {
    result.push(charset[random[i] % charset.length]);
  }

  return result.join('');
}

console.log(generateRandomString(32));
