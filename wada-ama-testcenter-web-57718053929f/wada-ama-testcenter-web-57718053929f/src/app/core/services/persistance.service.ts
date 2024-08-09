import { Injectable } from '@angular/core';

@Injectable()
export class PersistanceService {
    set(key: string, data: string): boolean {
        try {
            localStorage.setItem(key, data);
            return true;
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
        return false;
    }

    get(key: string): string | undefined {
        try {
            const value = localStorage.getItem(key);
            return value || undefined;
        } catch (e) {
            console.error('Error getting data from localStorage', e);
        }
        return undefined;
    }

    remove(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing data from localStorage', e);
        }
        return false;
    }

    keys(): Array<string> {
        const keys = [];
        for (let i = 0; i < localStorage.length; i += 1) {
            try {
                const key = localStorage.key(i);
                if (key) {
                    keys.push(key);
                }
            } catch (e) {
                console.error('Error getting data from localStorage', e);
            }
        }
        return keys;
    }

    get length(): number {
        return localStorage.length;
    }
}
