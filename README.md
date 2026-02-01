# 📊 JSON to Excel Converter v2.0

Convertisseur JSON vers Excel avec visualisation en arbre interactif.
**Version Vite** - Moderne, rapide, sans bugs ! ✨

## ✨ Fonctionnalités

- ✅ Visualisation JSON en arbre interactif (fait maison)
- ✅ Export vers Excel (.xlsx) en un clic
- ✅ Aplatissement automatique des objets imbriqués
- ✅ Interface simple et intuitive
- ✅ 100% côté client (vos données restent privées)
- ✅ Responsive (fonctionne sur mobile)
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

✅ **Le site s'ouvre automatiquement sur http://localhost:3000**

## 🛠️ Commandes disponibles

```bash
npm run dev       # Lancer en développement (port 3000)
npm run build     # Compiler pour production
npm run preview   # Prévisualiser le build de production
```

## 📦 Structure du projet

```
json-to-excel-converter/
├── index.html                # Page HTML principale
├── vite.config.js           # Configuration Vite
├── package.json             # Dépendances
├── src/
│   ├── main.jsx            # Point d'entrée
│   ├── App.jsx             # Composant principal
│   ├── App.css             # Styles
│   ├── TreeViewer.jsx      # Arbre JSON (fait maison !)
│   └── excelConverter.js   # Logique Excel
└── README.md
```


## 🔧 Résolution de problèmes

### "npm install" échoue
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port 3000 occupé
Vite utilisera automatiquement le port 3001, 3002, etc.


## 📊 Technologies utilisées

- **Vite 5** - Build tool ultra-rapide
- **React 18** - UI framework
- **ExcelJS** - Génération Excel
- **File-saver** - Téléchargement fichiers





## 🆘 Besoin d'aide ?

Le projet devrait fonctionner sans problème. Si vous rencontrez des bugs, revenez me voir !

## 📄 Licence

MIT - Libre d'utilisation

---

**Créé avec ❤️ | Propulsé par Vite + React**
