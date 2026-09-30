class Unit {
    private id: string;
    private organizationId: string;
    private name: string
    private createdAt: Date;
    private updatedAt: Date;

    constructor(id: string, organizationId: string, name: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}