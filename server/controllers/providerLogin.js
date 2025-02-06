import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";


import TokenAndCookie from "../utils/TokenAndCookie.js";
import User from "../models/userModel.js";

//google auth login
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_DOMAIN}/api/v1/user/auth/google/callback`,
},
    async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    const demoProfile = `https://avatar.iran.liara.run/username?username=${profile.displayName.replaceAll(" ", "+")}`;

                    user = await User.create({
                        username: profile.emails[0].value.split("@")[0],
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        profile: profile.photos ? profile.photos[0].value : demoProfile,
                        cover: demoProfile,
                        provider: "google",
                    });
                }
                await User.findByIdAndUpdate(user._id, { provider: "google", googleId: profile.id });
            }
            return done(null, user._id);
        } catch (error) {
            console.error("Google authentication error:", error);
            return done(error, null);
        }
    }))

export const googleRouter = (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })(req, res, next);
};

export const googleRouterCallback = async (req, res) => {
    passport.authenticate('google', { failureRedirect: '/author', session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Authentication failed', error: err || info });
        }

        try {
            const token = await TokenAndCookie(user, res);
            return res.redirect("https://sajib.xyz")
        } catch (error) {
            return res.status(500).json({
                message: 'An error occurred while processing your request.',
            });
        }
    })(req, res);
};

//github auth login
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_DOMAIN}/api/v1/user/auth/github/callback`,
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    user = await User.findOne({ email: profile.emails?.[0]?.value });

                    if (!user) {
                        const demoProfile = `https://avatar.iran.liara.run/username?username=${profile.username}`;

                        user = await User.create({
                            username: profile.username,
                            fullName: profile.displayName || profile.username, // Ensure we get full name
                            email: profile.emails?.[0]?.value || "",
                            githubId: profile.id,
                            profile: profile.photos?.[0]?.value || demoProfile, // Avatar
                            cover: demoProfile,
                            provider: "github",
                        });
                    }
                    await User.findByIdAndUpdate(user._id, { provider: "github", githubId: profile.id });
                }

                return done(null, user._id);
            } catch (error) {
                console.error("GitHub authentication error:", error);
                return done(error, null);
            }
        }
    )
);

export const githubRouter = (req, res, next) => {
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
};

export const githubRouterCallback = (req, res) => {
    passport.authenticate("github", { failureRedirect: "/author", session: false }, async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "Authentication failed", error: err });
        }

        try {
            const token = TokenAndCookie(user, res);
            return res.redirect(`https://sajib.xyz`);
        } catch (error) {
            return res.status(500).json({ message: "Error processing authentication" });
        }
    })(req, res);
};