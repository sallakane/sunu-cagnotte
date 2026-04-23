# Basculement vers Caddy

## 1. Installer Caddy sur le host

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy
```

## 2. Copier le Caddyfile

```bash
cp /var/www/sunu-cagnotte/infra/caddy/Caddyfile /etc/caddy/Caddyfile
```

## 3. Basculement (downtime ~5 secondes)

```bash
# Arrêter le proxy Docker actuel (libère les ports 80 et 443)
cd /var/www/sunu-cagnotte
docker compose -f docker-compose.prod.yml stop proxy

# Démarrer Caddy (prend les ports 80/443, récupère les certs Let's Encrypt)
systemctl enable caddy
systemctl start caddy

# Redémarrer le proxy Docker sur le port interne 8080
docker compose -f docker-compose.prod.yml up -d proxy
```

## 4. Vérifier

```bash
systemctl status caddy
curl -I https://sunu-cagnotte.org
docker ps | grep proxy
```

## Ajouter un deuxième projet plus tard

1. Déploie ton projet dans /var/www/rapport avec son propre docker-compose
   et bind son port interne sur 127.0.0.1:8081
2. Ajoute dans /etc/caddy/Caddyfile :
   ```
   mon-autre-domaine.com {
       reverse_proxy localhost:8081
   }
   ```
3. Recharge Caddy : `systemctl reload caddy`
   → Caddy récupère automatiquement le certificat SSL pour le nouveau domaine
