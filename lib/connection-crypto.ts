const encoder = new TextEncoder();
const context = (ownerId: string) => encoder.encode("pathforge:gemini:v1:" + ownerId);
const toHex = (bytes: Uint8Array) => Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
function fromHex(value: string) {
  if (!/^(?:[a-f0-9]{2})+$/i.test(value)) throw new Error("Invalid encrypted connection.");
  return new Uint8Array(value.match(/../g)!.map(byte => parseInt(byte, 16)));
}
async function encryptionKey(secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(secret)) throw new Error("Invalid connection encryption key.");
  return crypto.subtle.importKey("raw", fromHex(secret), "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encryptConnection(apiKey: string, ownerId: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({name:"AES-GCM", iv, additionalData:context(ownerId)}, await encryptionKey(secret), encoder.encode(apiKey));
  return "v1." + toHex(iv) + "." + toHex(new Uint8Array(encrypted));
}
export async function decryptConnection(value: string, ownerId: string, secret: string) {
  const [version, nonce, ciphertext, extra] = value.split(".");
  if (version !== "v1" || !nonce || nonce.length !== 24 || !ciphertext || extra !== undefined) throw new Error("Invalid encrypted connection.");
  const decrypted = await crypto.subtle.decrypt({name:"AES-GCM", iv:fromHex(nonce), additionalData:context(ownerId)}, await encryptionKey(secret), fromHex(ciphertext));
  return new TextDecoder().decode(decrypted);
}
