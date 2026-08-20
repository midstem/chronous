# Chronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless scheduling engine. The core owns time zones,
DST, recurrence and the layout of overlapping events; a thin adapter hands it to
your framework as hooks and headless primitives. The markup, the CSS and the
accessibility hooks stay yours — geometry is computed for you, cosmetics are
opt-in.</p>

## Packages

| Package                                     | Description                                                  |
| ------------------------------------------- | ------------------------------------------------------------ |
| [`@midstem/chronous`](packages/core)        | The engine: time model, layout, recurrence. No React, no DOM |
| [`@midstem/chronous-react`](packages/react) | Hooks and headless primitives for React                      |

The previous generation shipped as `chronous@1.0.2` and stays available under
the git tag [`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).

## License

MIT
