class CostCenter {
    private id: string;
    private organizationId: string;
    private unitId: string;
    private code: string;
    private name: string;
    private createdAt: Date;
    private updatedAt: Date;


    constructor(id: string, organizationId: string, unitId: string, code: string, name: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.organizationId = organizationId;
        this.unitId = unitId;
        this.code = code;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}