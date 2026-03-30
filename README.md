# Projet DevOps - K8s 3-Tiers

Ce projet est une application web 3-tiers (Frontend Vue.js, Backend Flask, Redis) configurée pour être déployée sur Kubernetes avec un pipeline CI/CD GitHub Actions.


## Comment lancer le projet (Localement sur Minikube)

### Prérequis
- Docker
- Minikube
- Kubectl

### Etapes

1.  **Démarrer Minikube**
    ```bash
    minikube start
    ```

2.  **Pointer Docker vers Minikube**
    Pour que Kubernetes puisse trouver vos images locales sans les pousser sur DockerHub :
    ```bash
    # Sur Windows (PowerShell)
    minikube -p minikube docker-env --shell powershell | Invoke-Expression
    
    # Sur Linux/Mac
    eval $(minikube docker-env)
    ```

3.  **Construire les images Docker**
    ```bash
    docker build -t paperclip-backend:latest ./backend
    docker build -t paperclip-frontend:latest ./frontend
    ```

4.  **Déployer sur Kubernetes**
    Appliquer tous les fichiers de configuration :
    ```bash
    kubectl apply -f k8s/
    ```

5.  **Accéder à l'application**
    Le Frontend est exposé via un service de type `LoadBalancer` (ou NodePort simulé par Minikube).
    ```bash
    # Cette commande ouvrira le navigateur directement
    minikube service frontend
    ```
    Ou pour voir l'URL :
    ```bash
    minikube service frontend --url
    ```

---

## Pipeline CI/CD (GitHub Actions)

Le fichier `.github/workflows/main.yml` définit l'automatisation. Voici ce qui se passe quand vous faites un `git push` sur la branche `main` :

> [!IMPORTANT]
> Pour que l'étape "Push to Docker Hub" fonctionne, vous devez ajouter deux secrets dans votre repo GitHub (**Settings > Secrets and variables > Actions**) :
> - `DOCKER_USERNAME` : votre pseudo Docker Hub
> - `DOCKER_PASSWORD` : votre token d'accès Docker Hub

### 1. **Job: Run Backend Tests** (CI)
- GitHub démarre une machine virtuelle Ubuntu.
- Il lance un **service Redis** temporaire.
- Il installe Python et les dépendances (`requirements.txt`).
- Il exécute les tests unitaires avec `pytest`.
- **Si ça échoue**, tout s'arrête (pas de build, pas de déploiement).

### 2. **Job: Build Docker Images** (CI)
- S'exécute uniquement si les tests sont OK (`needs: test-backend`).
- Construit l'image du Backend (`paperclip-backend`).
- Construit l'image du Frontend (`paperclip-frontend`).
- *Note : Dans un vrai projet, on ajouterait une étape "Push to DockerHub" ici.*

### 3. **Job: Deploy to Kubernetes** (CD)
- S'exécute uniquement si le build est OK.
- Simule le déploiement sur le cluster (affiche les commandes `kubectl apply`).
- Pour un vrai déploiement, il faudrait configurer les `KUBECONFIG` secrets dans GitHub.