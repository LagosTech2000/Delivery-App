import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './environment';
import User from '../models/User';
import { JwtPayload, GoogleProfile, UserRole, UserStatus } from '../types';
import { AuthenticationError } from '../utils/errors';

// JWT Strategy for protecting routes
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await User.findByPk(payload.userId);

      if (!user) {
        return done(null, false);
      }

      if (user.status !== UserStatus.ACTIVE) {
        return done(new AuthenticationError('Account is not active'), false);
      }

      if (user.isAccountLocked()) {
        return done(new AuthenticationError('Account is temporarily locked'), false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth 2.0 Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile: GoogleProfile, done) => {
        try {
          const email = profile.emails[0].value;

          // Check if user already exists with this Google ID
          let user = await User.findOne({
            where: { google_id: profile.id },
          });

          if (user) {
            // User found, update last login
            user.last_login = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with this email (email/password user)
          user = await User.findOne({
            where: { email },
          });

          if (user) {
            // Link Google account to existing user
            user.google_id = profile.id;
            user.oauth_provider = 'google';
            user.email_verified = true;
            user.avatar = user.avatar || profile.photos[0]?.value || null;
            user.last_login = new Date();
            await user.save();
            return done(null, user);
          }

          // Create new user with Google account
          const newUser = await User.create({
            email,
            google_id: profile.id,
            oauth_provider: 'google',
            name: profile.displayName,
            avatar: profile.photos[0]?.value || null,
            email_verified: true,
            password_hash: null, // No password for Google OAuth users
            role: UserRole.CUSTOMER, // Default role
            status: UserStatus.ACTIVE,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Serialize user for session (not used in JWT auth, but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
