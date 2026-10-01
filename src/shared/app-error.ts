import type {ErrorKind} from "@shared/error-kind";

export abstract class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly kind: ErrorKind,
        public readonly details?: Record<string, unknown>,
    ) {
        super(message);

        this.name = new.target.name;
    }
}