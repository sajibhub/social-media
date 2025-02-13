import fs from 'fs';
import CryptoJS from 'crypto-js';

const OneTimeToken = async (req, res, next) => {
    try {
        const { token } = req.headers

        if (!token) {
            return res.status(401).json({
                message: "Access denied",
            });
        }

        const decrypt = () => {
            try {
                const bytes = CryptoJS.AES.decrypt(token, process.env.CRYPTO_SECRET);

                const decrypted = bytes.toString(CryptoJS.enc.Utf8);

                if (!decrypted) {
                    return res.status(401).json({
                        message: "Access denied",
                    });
                }
                return decrypted;
            } catch (e) { }
        };

        if (decrypt() < new Date().getTime()) {
            return res.status(401).json({
                message: "Access denied",
            });
        }

        if (!fs.existsSync("token.json")) {
            fs.writeFile("token.json", JSON.stringify([]), (err) => {
                if (err) {
                    throw new Error("File Create Failed");
                }
                console.log("File created successfully!");
            });
            return;
        }

        fs.readFile("token.json", "utf8", (err, data) => {
            if (err) {
                throw new Error("File Read Failed");
            }

            let tokens;
            try {
                tokens = JSON.parse(data);
            } catch (parseErr) {
                throw new Error("Failed to parse JSON in the file.");
            }

            if (!Array.isArray(tokens)) {
                tokens = [];
            }


            const isToken = tokens.some((item) => item.includes(token));

            if (isToken) {
                return res.status(401).json({
                    message: "access denied",
                });
            }

            tokens.push(token);

            fs.writeFile("token.json", JSON.stringify(tokens, null, 2), (err) => {
                if (err) {
                    throw new Error("File Write Failed");
                }
                next()
            });
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
};

export default OneTimeToken;
