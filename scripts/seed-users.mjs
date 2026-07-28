#!/usr/bin/env node
/**
 * Creates demo users in Supabase Auth via the Admin API.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
const USERS = [
  {
    email: "test@test.com",
    password: "Password1",
    full_name: "Test User",
  },
  {
    email: "owner@owner.com",
    password: "Password1",
    full_name: "Owner User",
  },
];

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  process.stderr.write(
    "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n",
  );
  process.exit(1);
}

async function ensureUser(user) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    }),
  });

  if (res.ok) {
    process.stdout.write(`Created ${user.email}\n`);
    return;
  }

  const body = await res.text();
  if (body.includes("already") || res.status === 422) {
    process.stdout.write(`User already exists: ${user.email}\n`);
    return;
  }

  throw new Error(`Failed to create ${user.email}: ${body}`);
}

for (const user of USERS) {
  await ensureUser(user);
}

process.stdout.write("Done. Profiles are created automatically via DB trigger.\n");
