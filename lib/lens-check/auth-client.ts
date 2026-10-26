"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// Share the session store so navigation updates as soon as sign-in/out succeeds.
export const authClient = createAuthClient();
