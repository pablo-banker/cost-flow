export class PersistenceConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PersistenceConflictError';
    }
}

export class PersistenceNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PersistenceNotFoundError';
    }
}