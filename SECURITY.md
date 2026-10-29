# Security

## Reporting a vulnerability

Please report privately, not in a public issue: the repo's *Security* tab →
*Report a vulnerability* (private to the maintainer).

Include what you found, how to reproduce it, and what it lets someone do. I aim
to reply within a week. Fixes go out on `main` and in a new `botling` release.

## What's in scope

botling turns a string into an SVG string. It has no dependencies, makes no
requests and stores nothing. The things worth reporting are:

- **Markup injection.** Apps put botling's SVG straight into pages (inline or
  as a `data:` URI). A seed or option that gets script, an event handler or
  arbitrary markup into the output is a vulnerability. The seed never appears in
  the output; the `title` option is escaped.
- **Resource use.** A seed or option that makes `botling()` hang, throw
  something other than a `RangeError` for a bad option, or produce output far
  larger than usual.
- **The playground's content security policy.** `vercel.json` sets a strict
  policy for the site. A bypass, or a page that works only because the policy is
  looser than it says, is in scope.
- **Supply chain.** A dependency or workflow that could ship code nobody here
  wrote.

Out of scope: robots you don't like the look of (please open an issue), and
issues in the hosting provider itself.
