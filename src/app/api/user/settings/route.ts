import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      await client.query(
        `INSERT INTO user_settings (profile_id)
         VALUES ($1)
         ON CONFLICT (profile_id) DO NOTHING`,
        [profile.id]
      );

      const settingsRes = await client.query(
        `SELECT theme, language, currency, profile_visibility, search_history, analytics, cookies,
                high_contrast, large_text, reduced_motion, screen_reader
         FROM user_settings
         WHERE profile_id = $1`,
        [profile.id]
      );

      const notifRes = await client.query(
        `SELECT notif_push, notif_email, notif_sms, notif_promotions
         FROM profiles
         WHERE id = $1`,
        [profile.id]
      );

      const s = settingsRes.rows[0] || {};
      const n = notifRes.rows[0] || {};

      return {
        theme: s.theme || 'system',
        language: s.language || 'en',
        currency: s.currency || 'INR',
        notifications: {
          push: n.notif_push ?? true,
          email: n.notif_email ?? true,
          sms: n.notif_sms ?? true,
          marketing: n.notif_promotions ?? true,
        },
        privacy: {
          profileVisibility: s.profile_visibility || 'private',
          searchHistory: s.search_history ?? true,
          analytics: s.analytics ?? true,
          cookies: s.cookies ?? true,
        },
        accessibility: {
          highContrast: s.high_contrast ?? false,
          largeText: s.large_text ?? false,
          reducedMotion: s.reduced_motion ?? false,
          screenReader: s.screen_reader ?? false,
        },
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Settings GET failed:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      await client.query(
        `INSERT INTO user_settings (profile_id)
         VALUES ($1)
         ON CONFLICT (profile_id) DO NOTHING`,
        [profile.id]
      );

      const currentRes = await client.query(
        `SELECT theme, language, currency, profile_visibility, search_history, analytics, cookies,
                high_contrast, large_text, reduced_motion, screen_reader
         FROM user_settings
         WHERE profile_id = $1`,
        [profile.id]
      );
      const current = currentRes.rows[0] || {};

      const notifications = body.notifications || {};
      if (Object.keys(notifications).length > 0) {
        await client.query(
          `UPDATE profiles
           SET notif_push = COALESCE($2, notif_push),
               notif_email = COALESCE($3, notif_email),
               notif_sms = COALESCE($4, notif_sms),
               notif_promotions = COALESCE($5, notif_promotions),
               updated_at = NOW()
           WHERE id = $1`,
          [
            profile.id,
            typeof notifications.push === 'boolean' ? notifications.push : null,
            typeof notifications.email === 'boolean' ? notifications.email : null,
            typeof notifications.sms === 'boolean' ? notifications.sms : null,
            typeof notifications.marketing === 'boolean' ? notifications.marketing : null,
          ]
        );
      }

      const privacy = body.privacy || {};
      const accessibility = body.accessibility || {};

      await client.query(
        `UPDATE user_settings
         SET theme = $2,
             language = $3,
             currency = $4,
             profile_visibility = $5,
             search_history = $6,
             analytics = $7,
             cookies = $8,
             high_contrast = $9,
             large_text = $10,
             reduced_motion = $11,
             screen_reader = $12,
             updated_at = NOW()
         WHERE profile_id = $1`,
        [
          profile.id,
          body.theme || current.theme || 'system',
          body.language || current.language || 'en',
          body.currency || current.currency || 'INR',
          privacy.profileVisibility || current.profile_visibility || 'private',
          typeof privacy.searchHistory === 'boolean' ? privacy.searchHistory : (current.search_history ?? true),
          typeof privacy.analytics === 'boolean' ? privacy.analytics : (current.analytics ?? true),
          typeof privacy.cookies === 'boolean' ? privacy.cookies : (current.cookies ?? true),
          typeof accessibility.highContrast === 'boolean' ? accessibility.highContrast : (current.high_contrast ?? false),
          typeof accessibility.largeText === 'boolean' ? accessibility.largeText : (current.large_text ?? false),
          typeof accessibility.reducedMotion === 'boolean' ? accessibility.reducedMotion : (current.reduced_motion ?? false),
          typeof accessibility.screenReader === 'boolean' ? accessibility.screenReader : (current.screen_reader ?? false),
        ]
      );

      const readBack = await client.query(
        `SELECT theme, language, currency, profile_visibility, search_history, analytics, cookies,
                high_contrast, large_text, reduced_motion, screen_reader
         FROM user_settings
         WHERE profile_id = $1`,
        [profile.id]
      );
      const profileNotifs = await client.query(
        `SELECT notif_push, notif_email, notif_sms, notif_promotions
         FROM profiles WHERE id = $1`,
        [profile.id]
      );

      const s = readBack.rows[0] || {};
      const n = profileNotifs.rows[0] || {};

      return {
        theme: s.theme,
        language: s.language,
        currency: s.currency,
        notifications: {
          push: n.notif_push ?? true,
          email: n.notif_email ?? true,
          sms: n.notif_sms ?? true,
          marketing: n.notif_promotions ?? true,
        },
        privacy: {
          profileVisibility: s.profile_visibility,
          searchHistory: s.search_history,
          analytics: s.analytics,
          cookies: s.cookies,
        },
        accessibility: {
          highContrast: s.high_contrast,
          largeText: s.large_text,
          reducedMotion: s.reduced_motion,
          screenReader: s.screen_reader,
        },
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Settings PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
