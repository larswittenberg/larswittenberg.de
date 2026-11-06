# Strava – Sync per GitHub Action (geplant)

Der Workflow ist **noch nicht angelegt**. `yarn strava:sync` ist aber bereits CI-tauglich, sodass später nur die Workflow-Datei ergänzt werden muss:

- nicht interaktiv, kein Warten auf das 15-min-Fenster bei `CI=true`
- Exit-Code `0` auch bei „nichts Neues“ und Tageslimit, `1` bei Fehlern (Auth, Netzwerk, DB)
- Ist `GITHUB_STEP_SUMMARY` gesetzt, wird eine Tabelle angehängt (ohne Aktivitätsnamen)
- In `GITHUB_OUTPUT` stehen `new_count`, `changed` und `refresh_token_rotated`
- Tokens nur aus `STRAVA_REFRESH_TOKEN`, keine Token-Datei

`strava:enrich` bleibt bewusst manuell/lokal (hoher Request-Bedarf).

## Secrets

| Secret | Wert |
| ------ | ---- |
| `STRAVA_CLIENT_ID` | Client-ID der Strava-App |
| `STRAVA_CLIENT_SECRET` | Client-Secret der Strava-App |
| `STRAVA_REFRESH_TOKEN` | `refresh_token` aus `data/strava-tokens.json` |
| `GH_SECRETS_TOKEN` | Fine-grained PAT mit „Secrets: Read and write“ auf dieses Repo (für die Token-Rotation) |

## Refresh-Token-Rotation

Strava kann beim Refresh einen neuen Refresh-Token ausgeben; der alte wird dann irgendwann ungültig. Das Skript erkennt das (Warnung ohne Token-Wert, Output `refresh_token_rotated=true`) und schreibt den neuen Token in die Datei aus `STRAVA_ROTATED_TOKEN_FILE`, falls gesetzt.

- **(a) Empfohlen:** Der Workflow aktualisiert das Secret per `gh secret set STRAVA_REFRESH_TOKEN < datei` (Wert nur über stdin, nie loggen).
- **(b)** Der Job schlägt fehl und das Secret wird manuell erneuert (`yarn strava:auth` lokal, Wert aus `data/strava-tokens.json` eintragen).

## Skizze `.github/workflows/strava-sync.yml`

```yaml
name: Strava Sync

on:
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:

permissions:
  contents: write

concurrency: strava-sync

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: corepack enable
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'
      - run: yarn install --immutable
      - name: Strava-Aktivitäten synchronisieren
        id: sync
        run: yarn strava:sync
        env:
          STRAVA_CLIENT_ID: ${{ secrets.STRAVA_CLIENT_ID }}
          STRAVA_CLIENT_SECRET: ${{ secrets.STRAVA_CLIENT_SECRET }}
          STRAVA_REFRESH_TOKEN: ${{ secrets.STRAVA_REFRESH_TOKEN }}
          STRAVA_ROTATED_TOKEN_FILE: ${{ runner.temp }}/strava-refresh-token
      # always(): also persist a rotated token if the sync step failed afterwards.
      - name: Refresh-Token-Secret aktualisieren
        if: always()
        run: |
          if [ -s "$RUNNER_TEMP/strava-refresh-token" ]; then
            gh secret set STRAVA_REFRESH_TOKEN < "$RUNNER_TEMP/strava-refresh-token"
          fi
        env:
          GH_TOKEN: ${{ secrets.GH_SECRETS_TOKEN }}
      - name: Änderungen committen und pushen
        if: steps.sync.outputs.changed == 'true'
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add src/data/strava.db
          if ! git diff --staged --quiet; then
            git commit -m "chore: update strava activities"
            git push
          fi
```

- Der Push löst das Vercel-Deployment aus.
- `concurrency: strava-sync` verhindert, dass sich manueller und geplanter Lauf überschneiden.
- Lokal vor einem eigenen `strava:sync` immer erst `git pull`, um Merge-Konflikte in der Binärdatei `strava.db` zu vermeiden.
