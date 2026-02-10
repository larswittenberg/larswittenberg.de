# larswittenberg.de - Next.js & TailwindCSS

My personal website built with Next.js & TailwindCSS

## Credits

- Social Media / Brand Icons: [https://simpleicons.org/](https://simpleicons.org/)
- [Victory Emoji](https://emojipedia.org/victory-hand/)
- Mockup Images [https://magicmockups.com/](https://magicmockups.com/)

## Projekte - Github-Stars

- `.env.local` anlegen und einen **GitHub Personal Access Token (PAT)** sowie deinen Benutzernamen hinterlegen:

```env
GH_TOKEN=<dein-token>
GH_USERNAME=<dein-github-benutzername>
```

Der Token benötigt mindestens Leserechte für Sternlisten (z. B. Scope `read:user` oder `public_repo`).

- Daten abrufen: `yarn update-stars` ausführen. Dieser Befehl lädt alle deine Sterne von der GitHub-API und speichert sie in `src/data/starred-repositories.json`. **Diese Datei muss eingecheckt werden.**
- Entwicklung: `yarn dev` starten und `http://localhost:3000` öffnen.

> **Wichtig für Deployments (z. B. Vercel):** Hinterlege dieselben Variablen im Projekt unter **Settings → Environment Variables**.
> Ohne gültigen `GH_TOKEN` kann das `update-stars`-Skript nicht auf die GitHub-API zugreifen.

### GitHub-Token für Produktionsdeployments

1. Erstelle im GitHub-Account einen Personal Access Token (klassisch) mit mindestens dem Scope `public_repo` (Leserechte).
2. Öffne z. B. auf Vercel dein Projekt → **Settings → Environment Variables** und hinterlege:

   |Key            |Value                                   |
   |-------------- |--------------------------------------- |
   |`GH_TOKEN`     |dein Personal Access Token              |
   |`GH_USERNAME`  |(optional) GitHub-Account, dessen Stars geladen werden |

3. Trigger anschließend ein Re-Deployment. Ohne diese Variablen schlägt der Server mit `403 Forbidden` fehl und die Oberfläche zeigt den GitHub API-Fehler an.

> Tipp: Bewahre den Token sicher auf; in Pull Requests oder Logs darf er nicht auftauchen. Wechsle ihn bei Bedarf aus und triggere anschließend erneut ein Deployment.
