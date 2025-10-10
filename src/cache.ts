export class CacheRoute {
    private cache: Map<string, any> = new Map();

    public set(key: string, value: any, ttl: number): void {
        this.cache.set(key, { value, timestamp: Date.now(), ttl });
    }

    public get(key: string): any | undefined {
        const item = this.cache.get(key);
        if (!item) {
            return undefined;
        }

        const isExpired = this.isExpired(key);
        if (isExpired) {
            this.cache.delete(key);
            return undefined;
        }

        return item.value;
    }

    public has(key: string): boolean {
        return this.cache.has(key) && !this.isExpired(key);
    }

    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }

    private isExpired(key: string): boolean {
        const item = this.cache.get(key);
        if (!item) {
            return true; // If it doesn't exist, consider it expired for practical purposes
        }
        const expired = Date.now() - item.timestamp > item.ttl;
        if (expired) {
            this.cache.delete(key);
        }
        return expired;
    }
}