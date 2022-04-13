require('dotenv').config()

class StackEnviroments {

    public static get RESOURCES_PREFIX(): string {
        return StackEnviroments.getValue("RESOURCES_PREFIX");
    }

    static getValue(propertyName: string): string {
        return process.env[propertyName] || "";
    }
}

export { StackEnviroments };
