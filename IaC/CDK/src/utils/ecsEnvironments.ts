require('dotenv').config()

class EcsEnvironments {

    public static get ECS_TASK_CONTAINERS_MEMORY_LIMIT(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_TASK_CONTAINERS_MEMORY_LIMIT"
        );
    }

    public static get ECS_MOODLE_PORT(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_MOODLE_PORT"
        );
    }

    public static get ECS_MIN_CAPACITY(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_MIN_CAPACITY"
        );
    }

    public static get ECS_MAX_CAPACITY(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_MAX_CAPACITY"
        );
    }

    public static get ECS_IMAGES_TAG(): string {
        return EcsEnvironments.getValue(
            "ECS_IMAGES_TAG"
        );
    }

    public static get ECS_CPU_UTILIZATION_PERCENT(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_CPU_UTILIZATION_PERCENT"
        );
    }

    public static get ECS_MEMORY_UTILIZATION_PERCENT(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_MEMORY_UTILIZATION_PERCENT"
        );
    }

    public static get ECS_TARGET_CAPACITY_PERCENT(): number {
        return EcsEnvironments.getNumberValue(
            "ECS_TARGET_CAPACITY_PERCENT"
        );
    }

    private static getValue(propertyName: string): string {
        return process.env[propertyName] || "";
    }

    private static getNumberValue(propertyName: string): number {
        return parseInt(process.env[propertyName] || "0");
    }
}

export { EcsEnvironments };
