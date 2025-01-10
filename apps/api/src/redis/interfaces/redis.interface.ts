/**
 * Interface commune pour les services Redis (Standalone et Cluster)
 */
export interface IRedisService {
  /**
   * Récupère une valeur par sa clé
   * @param key - Clé Redis
   * @returns La valeur associée ou null si non trouvée
   */
  get(key: string): Promise<string | null>;

  /**
   * Stocke une valeur avec une clé optionnelle
   * @param key - Clé Redis
   * @param value - Valeur à stocker
   * @param ttl - Durée de vie en secondes (optionnel)
   */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Supprime une ou plusieurs clés
   * @param keys - Une ou plusieurs clés à supprimer
   * @returns Nombre de clés supprimées
   */
  del(...keys: string[]): Promise<number>;

  /**
   * Vérifie si une clé existe
   * @param key - Clé à vérifier
   * @returns true si la clé existe, false sinon
   */
  exists(key: string): Promise<boolean>;

  /**
   * Définit une durée de vie sur une clé
   * @param key - Clé à modifier
   * @param ttl - Durée de vie en secondes
   */
  expire(key: string, ttl: number): Promise<boolean>;

  /**
   * Récupère plusieurs valeurs par leurs clés
   * @param keys - Liste des clés
   * @returns Array des valeurs dans l'ordre des clés (null si clé non trouvée)
   */
  mget(keys: string[]): Promise<(string | null)[]>;

  /**
   * Stocke plusieurs paires clé-valeur
   * @param keyValueMap - Map des paires clé-valeur
   */
  mset(keyValueMap: Record<string, string>): Promise<void>;

  /**
   * Incrémente un compteur
   * @param key - Clé du compteur
   * @returns Nouvelle valeur
   */
  incr(key: string): Promise<number>;

  /**
   * Décrémente un compteur
   * @param key - Clé du compteur
   * @returns Nouvelle valeur
   */
  decr(key: string): Promise<number>;

  /**
   * Ajoute des éléments à un set
   * @param key - Clé du set
   * @param members - Éléments à ajouter
   * @returns Nombre d'éléments ajoutés
   */
  sadd(key: string, ...members: string[]): Promise<number>;

  /**
   * Récupère tous les éléments d'un set
   * @param key - Clé du set
   * @returns Array des éléments
   */
  smembers(key: string): Promise<string[]>;

  /**
   * Supprime des éléments d'un set
   * @param key - Clé du set
   * @param members - Éléments à supprimer
   * @returns Nombre d'éléments supprimés
   */
  srem(key: string, ...members: string[]): Promise<number>;

  /**
   * Vérifie la connexion au serveur Redis
   * @returns true si connecté, false sinon
   */
  ping(): Promise<boolean>;

  /**
   * Nettoie la connexion
   */
  cleanup(): Promise<void>;

  /**
   * Récupère le client Redis
   * @returns Le client Redis
   */
  getClient(): any;

  /**
   * Attend la connexion au serveur Redis
   * @returns Une promesse résolue lorsque la connexion est établie
   */
  waitForConnection(): Promise<void>;

  /**
   * Initialisation du module
   * @returns Une promesse résolue lorsque l'initialisation est terminée
   */
  onModuleInit(): Promise<void>;
}
