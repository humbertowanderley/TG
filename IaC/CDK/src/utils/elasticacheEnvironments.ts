require('dotenv').config()

class ElasticacheEnviroments {
    private static readonly LIST_SEPARATOR = ',';

    public static get NODE_TYPE(): string {
        return ElasticacheEnviroments.getValue(
            "ELASTICACHE_NODE_TYPE"
        );
    }

    public static get ENGINE(): string {
        return ElasticacheEnviroments.getValue(
            "ELASTICACHE_ENGINE"
        );
    }

    public static get ENGINE_VERSION(): string {
        return ElasticacheEnviroments.getValue(
            "ELASTICACHE_ENGINE_VERSION"
        );
    }

    public static get NUM_CACHE_CLUSTERS(): number {
        return ElasticacheEnviroments.getNumberValue(
            "ELASTICACHE_NUM_CLUSTERS"
        );
    }

    public static get DEFAULT_SUBNET_A_CIDR(): string {
        return ElasticacheEnviroments.getValue(
            "DEFAULT_SUBNET_A_CIDR"
        );
    }

    public static get DEFAULT_SUBNET_B_CIDR(): string {
        return ElasticacheEnviroments.getValue(
            "DEFAULT_SUBNET_B_CIDR"
        );
    }

    public static get FLAVORS_THAT_SUPPORT_MORE_THAN_ONE_CLUSTER(): string[] {
        return ElasticacheEnviroments.getValue(
            "FLAVORS_THAT_SUPPORT_MORE_THAN_ONE_CLUSTER"
        ).split(ElasticacheEnviroments.LIST_SEPARATOR);
    }

    public static get DOES_FLAVOR_SUPPORT_MORE_THAN_ONE_CLUSTER(): boolean {
        return ElasticacheEnviroments.FLAVORS_THAT_SUPPORT_MORE_THAN_ONE_CLUSTER.includes(ElasticacheEnviroments.FLAVOR);
    }

    public static get FLAVOR(): string {
        return ElasticacheEnviroments.getValue(
            "FLAVOR"
        );
    }

    private static getValue(propertyName: string): string {
        return process.env[propertyName] || "";
    }

    private static getNumberValue(propertyName: string): number {
        return parseInt(process.env[propertyName] || "0");
    }
}

export { ElasticacheEnviroments };
