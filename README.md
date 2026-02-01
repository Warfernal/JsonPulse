# 📊 JSON to Excel Converter v2.0

Convertisseur JSON vers Excel avec visualisation en arbre et graphe interactif.
**Vite + MUI (Material UI)** ✨

## ✨ Fonctionnalités

- ✅ Visualisation JSON en arbre + graphe interactif
- ✅ Export vers Excel (.xlsx) en un clic
- ✅ Aplatissement automatique des objets imbriqués
- ✅ Interface simple et intuitive
- ✅ 100% côté client (vos données restent privées)
- ✅ Responsive (fonctionne sur mobile)
- ✅ Import JSON + drag & drop
- ✅ Recherche dans le graphe avec auto-focus
- ✅ **Aucun bug de dépendances !**

## 🚀 Installation

### Prérequis

- Node.js 16+ installé

### Étapes (3 commandes)

```bash
# 1. Entrer dans le dossier
cd json-to-excel-converter

# 2. Installer les dépendances (2-3 minutes)
npm install

# 3. Lancer le projet
npm run dev
```

✅ **Le site est disponible sur http://localhost:3000**

## 📝 Différences avec la version précédente

### Avant (Create React App)
- ❌ react-scripts obsolète
- ❌ Bugs de dépendances
- ❌ Lent à démarrer

### Maintenant (Vite)
- ✅ Moderne et maintenu
- ✅ Aucun conflit de dépendances
- ✅ Démarrage ultra-rapide (< 1 seconde)
- ✅ Hot reload instantané

## 🛠️ Commandes disponibles

```bash
npm run dev       # Lancer en développement (port 3000)
npm run build     # Compiler pour production
npm run preview   # Prévisualiser le build de production
```

## 📦 Structure du projet

```
JsonPulse/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── styles/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── components.css
│   │   └── layout.css
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── TreeViewer.jsx
│   ├── TreeViewer.css
│   ├── JsonTreeView.jsx
│   ├── JsonTreeView.css
│   └── excelConverter.js
└── README.md
```

## 🌐 Déploiement sur Vercel (GRATUIT)

### Méthode automatique (recommandée)

1. **Pousser sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE-USERNAME/json-excel.git
   git push -u origin main
   ```

2. **Déployer sur Vercel**
   - Aller sur https://vercel.com
   - "Import Project" → Sélectionner votre repo
   - Vite est **auto-détecté** ✨
   - Cliquer "Deploy"

3. **C'est en ligne !**
   - URL: `https://votre-projet.vercel.app`
   - Déploiement automatique à chaque `git push`

## 🎨 Personnalisation

### Thème & styles

Les styles sont organisés par couche :
- `src/styles/variables.css` (tokens & thèmes)
- `src/styles/base.css` (reset & base)
- `src/styles/components.css` (UI)
- `src/styles/layout.css` (breakpoints)

### Modifier les textes

Éditez `src/App.jsx` et changez les textes dans le JSX.

## 🔧 Résolution de problèmes

### "npm install" échoue
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port 3000 occupé
Vite utilisera automatiquement le port 3001, 3002, etc.

### Import errors
Vite utilise ESM (import/export). Assurez-vous d'avoir `"type": "module"` dans package.json.

## 📊 Technologies utilisées

- **Vite 5** - Build tool ultra-rapide
- **React 18** - UI framework
- **Tailwind CSS** - Design system & utilities
- **ExcelJS** - Génération Excel
- **File-saver** - Téléchargement fichiers

## 🎨 UI stack (MUI)

We use **MUI** for layout, theming, and components. Custom CSS is kept only for the graph/tree viewers.

## 🎓 Améliorations futures possibles

- [ ] Upload fichier JSON
- [ ] Export CSV
- [ ] Sélection branches à exporter (checkboxes)
- [ ] Thème sombre
- [ ] Historique conversions
- [ ] Mode premium avec paiement

## 💰 Coûts

- **Développement**: 0€
- **Hébergement Vercel**: 0€
- **Domaine personnalisé**: ~10€/an (optionnel)

**Total: 0€/mois** jusqu'à avoir beaucoup de trafic !

## 🆘 Besoin d'aide ?

Le projet devrait fonctionner sans problème. Si vous rencontrez des bugs, revenez me voir !

## 📄 Licence

MIT - Libre d'utilisation

---

**Créé avec ❤️ | Propulsé par Vite + React**
