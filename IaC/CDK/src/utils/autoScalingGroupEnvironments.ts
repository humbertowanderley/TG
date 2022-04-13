require('dotenv').config()

class AutoScalingGroupEnviroments {

    public static get ASG_INSTANCE_TYPE(): string {
        return AutoScalingGroupEnviroments.getValue(
            "ASG_INSTANCE_TYPE"
        );
    }

    public static get ASG_MIN_CAPACITY(): number {
        return AutoScalingGroupEnviroments.getNumberValue(
            "ASG_MIN_CAPACITY"
        );
    }

    public static get ASG_MAX_CAPACITY(): number {
        return AutoScalingGroupEnviroments.getNumberValue(
            "ASG_MAX_CAPACITY"
        );
    }

    private static getValue(propertyName: string): string {
        return process.env[propertyName] || "";
    }

    private static getNumberValue(propertyName: string): number {
        return parseInt(process.env[propertyName] || "0");
    }
}

export { AutoScalingGroupEnviroments };
