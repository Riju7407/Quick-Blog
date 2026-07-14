import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY?.trim(),
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY?.trim(),
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT?.trim(),
});

console.log('ImageKit initialized:', {
    hasPublicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
    hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
    hasUrlEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
    hasUploadMethod: typeof imagekit.upload === 'function'
});

export default imagekit;