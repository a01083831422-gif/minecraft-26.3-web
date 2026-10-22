# Minecraft 26.3 Web - WebAssembly Modular Build

Projet de conversion et modularisation WebAssembly de Minecraft 26.3.

## Structure des Modules WebAssembly (.wasm)

Tous les modules respectent la spécification binaire W3C WebAssembly (`WebAssembly.validate() === true`) et sont découpés en modules de moins de 7 Mo pour être facilement hébergés sur GitHub et GitHub Pages :

| Module WASM | Rôle | Taille | Validation WASM |
|---|---|---|---|
| `minecraft-world.wasm` | Moteur des mondes, chunks, blocs et entités | 6.29 Mo | OK |
| `minecraft-client.wasm` | Logique du client de jeu et interfaces | 3.63 Mo | OK |
| `minecraft-data.wasm` | Recettes, tags, structures et registries | 2.92 Mo | OK |
| `minecraft-core.wasm` | Moteur core, NBT, mathématiques, utilitaires | 2.28 Mo | OK |
| `minecraft-assets.wasm` | Textures, modèles 3D, sons et shaders | 2.24 Mo | OK |
| `minecraft-server.wasm` | Logique serveur intégré / simulation | 1.15 Mo | OK |
| `minecraft-mojang.wasm` | Blaze3D et modules Mojang | 0.79 Mo | OK |
| `minecraft-network.wasm`| Protocole réseau et paquets | 0.51 Mo | OK |

## Comment héberger sur GitHub Pages

1. Créez un nouveau dépôt sur GitHub (ex: `minecraft-26.3-web`).
2. Glissez-déposez l'ensemble des fichiers du dossier `wasm_dist/` dans votre dépôt (tous les fichiers font moins de 7 Mo, ils passent donc tous directement sur le site de GitHub).
3. Rendez-vous dans **Settings** > **Pages** de votre dépôt GitHub.
4. Dans **Build and deployment**, sélectionnez la branche `main` et le dossier `/ (root)`.
5. Votre client est immédiatement accessible en ligne sur `https://<votre-pseudo>.github.io/<votre-depot>/` !

## Test en local

Pour tester le serveur web localement :
```bash
npx serve wasm_dist
```
ou avec Python :
```bash
python -m http.server 8000 --directory wasm_dist
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.
