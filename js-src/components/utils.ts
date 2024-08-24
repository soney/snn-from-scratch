export function asFloat(val: string | null | undefined, default_value: number): number {
    if(val === null || val === undefined) {
        return default_value;
    } else {
        return parseFloat(val);
    }
}

export function asInt(val: string | null | undefined, default_value: number): number {
    if(val === null || val === undefined) {
        return default_value;
    } else {
        return parseInt(val);
    }
}

export function asBool(val: string | null | undefined, default_value: boolean): boolean {
    if(val === null || val === undefined) {
        return default_value;
    } else {
        return val.toLowerCase() === 'true';
    }
}

export function pause(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}