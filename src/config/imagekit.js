const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_3dS22wZ47Ljsh3bmehwgRWCpLtA=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_DuBolSwUPNlNAZE6zug+Zsh3uYc=",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/gotidr8fpq"
});

module.exports = imagekit;