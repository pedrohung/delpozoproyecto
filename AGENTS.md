<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Preserve the existing local browser store contract: this package is a prototype for a separate local REST server; browser permissions are not production authentication.
- Centralize profile availability in `src/lib/modules.ts` and daily financial summaries in `dayReport` so menus, operational screens and printed reports use the same rules.
- Shop items alone carry stock; migrate pre-stock browser examples without changing historical order or sale prices.
