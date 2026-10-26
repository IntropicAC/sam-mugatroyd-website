# Connect the existing Microsoft registration

Use your browser for these settings. VS Code already has the application code.
Reuse Neon `Perception47-database` and your existing Microsoft app registration.
Work only on the temporary `lens-check-auth-test` branch, not `main`.

## 1. Find the Neon settings

1. Open [Neon Console](https://console.neon.tech).
2. Open **Perception47-database**.
3. Select **lens-check-auth-test** in the project/branch selector at the top left.
4. Open **Settings → Auth**. Some screens label this **Better Auth**. If the
   overview has a Better Auth service row, open that service to find its settings.
5. Look for **OAuth providers → Add OAuth provider → Microsoft**.

Neon's general Console guide does not consistently list Microsoft, although its
branch API supports it. If Microsoft is absent, stop at this point and report
that it is missing; do not select another provider or create another project.
The connected Neon tool can configure Microsoft after credentials are supplied
through a secure local path. Never paste the secret into chat.

The user's screenshots on 26 October confirmed that the menu offers only
GitHub and Vercel while Google is already configured. Use the local-file path
below for Microsoft; there is no further Microsoft menu to find on that screen.

## 2. Find the values in the existing Microsoft registration

1. Open [Microsoft Entra admin center](https://entra.microsoft.com), then
   **Identity → Applications → App registrations → All applications**.
2. Open your existing registration. On **Overview**, find **Application (client)
   ID**. This is the client ID, not the object ID.
3. Open **Authentication**. Under the **Web** platform, add this exact redirect
   URI, preserving any existing redirect URIs:

   ```text
   https://ep-dark-resonance-zarvaw2v.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth/callback/microsoft
   ```

4. To support Outlook/Hotmail as well as work accounts, the registration's
   supported account types must include **personal Microsoft accounts**. For a
   multi-tenant work-and-personal registration, use tenant **common** in Neon.
   Check the registration's intended audience before changing an app used by
   another service.
5. Open **Certificates & secrets → Client secrets**. Use a valid client-secret
   **Value**, not its Secret ID. Microsoft displays a new value only when it is
   created. If the old value is unavailable, add a new secret without deleting
   existing secrets used by other services. Keep the value out of chat/source.

## 3. Connect and test

If Microsoft is offered in the Console, enter the values in that provider form.
For the confirmed missing-menu case, open `.env.lens-check-microsoft.local` in
VS Code, put the client ID and secret value after their `=` signs, and save it.
This blank template was created locally and is ignored by Git; Next.js does not
automatically load this filename. Tell the assistant the file is ready without
sending its contents. The assistant can pass the values to the connected Neon
provider tool without displaying them, targeting only the test branch. Keep any
provider error output redacted and verify the resulting configuration separately.

Once
configured, the application can enable Microsoft alongside Google through
`LENS_CHECK_AUTH_SOCIAL_PROVIDERS=google,microsoft` in its ignored test settings.

Test with an approved address and confirm the consent screen, verified session,
return to My results, refresh and sign-out. A configured button or initial
redirect does not establish a successful login. Do not move the test Auth URL or
credentials into production automatically. This branch expires on
**1 November 2026 at 22:06:18 GMT**.

Resend, DNS and payments are independent and remain deferred.

Sources: [Neon OAuth setup](https://neon.com/docs/auth/guides/setup-oauth),
[Neon branch provider API](https://api-docs.neon.tech/reference/addbranchneonauthoauthprovider),
[Microsoft app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).
