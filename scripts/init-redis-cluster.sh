#!/bin/sh

# Configuration
REDIS_PASSWORD="sl3_redis_password"
RETRY_INTERVAL=2
MAX_RETRIES=30

# Fonction de logging
log() {
    echo "[$(date)] $1"
}

# Attendre que tous les nœuds soient prêts
wait_for_nodes() {
    log "Attente du démarrage des nœuds Redis..."
    
    i=0
    while [ $i -lt $MAX_RETRIES ]; do
        if redis-cli -h sl3_beta-redis-master-1 -p 6379 -a "$REDIS_PASSWORD" ping > /dev/null 2>&1 && \
           redis-cli -h sl3_beta-redis-master-2 -p 6380 -a "$REDIS_PASSWORD" ping > /dev/null 2>&1 && \
           redis-cli -h sl3_beta-redis-master-3 -p 6381 -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
            log "Tous les nœuds Redis sont prêts"
            return 0
        fi
        i=$((i + 1))
        sleep $RETRY_INTERVAL
    done
    
    log "Timeout en attendant les nœuds Redis"
    return 1
}

# Réinitialiser tous les nœuds
reset_nodes() {
    log "Réinitialisation des nœuds..."
    
    redis-cli -h sl3_beta-redis-master-1 -p 6379 -a "$REDIS_PASSWORD" FLUSHALL > /dev/null 2>&1
    redis-cli -h sl3_beta-redis-master-1 -p 6379 -a "$REDIS_PASSWORD" CLUSTER RESET HARD > /dev/null 2>&1
    
    redis-cli -h sl3_beta-redis-master-2 -p 6380 -a "$REDIS_PASSWORD" FLUSHALL > /dev/null 2>&1
    redis-cli -h sl3_beta-redis-master-2 -p 6380 -a "$REDIS_PASSWORD" CLUSTER RESET HARD > /dev/null 2>&1
    
    redis-cli -h sl3_beta-redis-master-3 -p 6381 -a "$REDIS_PASSWORD" FLUSHALL > /dev/null 2>&1
    redis-cli -h sl3_beta-redis-master-3 -p 6381 -a "$REDIS_PASSWORD" CLUSTER RESET HARD > /dev/null 2>&1
}

# Créer le cluster
create_cluster() {
    log "Création du cluster Redis..."
    
    # Créer le cluster avec les nœuds maîtres
    redis-cli --cluster create \
        sl3_beta-redis-master-1:6379 \
        sl3_beta-redis-master-2:6380 \
        sl3_beta-redis-master-3:6381 \
        -a "$REDIS_PASSWORD" \
        --cluster-yes
    
    if [ $? -ne 0 ]; then
        log "Erreur lors de la création du cluster"
        return 1
    fi
    
    log "Cluster créé avec succès"
    return 0
}

# Vérifier l'état du cluster
check_cluster() {
    log "Vérification de l'état du cluster..."
    
    # Attendre que le cluster soit stable
    i=0
    while [ $i -lt $MAX_RETRIES ]; do
        cluster_info=$(redis-cli -h sl3_beta-redis-master-1 -p 6379 -a "$REDIS_PASSWORD" cluster info)
        if echo "$cluster_info" | grep -q "cluster_state:ok"; then
            log "Cluster est stable et opérationnel"
            redis-cli -h sl3_beta-redis-master-1 -p 6379 -a "$REDIS_PASSWORD" cluster nodes
            return 0
        fi
        i=$((i + 1))
        sleep $RETRY_INTERVAL
    done
    
    log "Le cluster n'est pas devenu stable dans le délai imparti"
    return 1
}

# Programme principal
log "Démarrage de l'initialisation du cluster Redis..."

if ! wait_for_nodes; then
    log "Impossible de se connecter aux nœuds Redis. Abandon."
    exit 1
fi

reset_nodes

if ! create_cluster; then
    log "Échec de la création du cluster. Abandon."
    exit 1
fi

if ! check_cluster; then
    log "Le cluster n'est pas dans un état stable. Abandon."
    exit 1
fi

log "Initialisation du cluster Redis terminée avec succès"
exit 0
