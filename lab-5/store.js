import { randomHsl } from './helpers.js';

class Store {
    constructor() {
        const saved = localStorage.getItem('shapes');
        this.shapes = saved ? JSON.parse(saved) : [];

        this.subscribers = [];
    }

    subscribe(fn) {
        this.subscribers.push(fn);
    }

    notify() {
        localStorage.setItem('shapes', JSON.stringify(this.shapes));
        this.subscribers.forEach((fn) => fn(this.shapes));
    }

    addShape(type) {
        this.shapes.push({
            id: crypto.randomUUID(),
            type,
            color: randomHsl(),
        });
        this.notify();
    }

    removeShape(id) {
        this.shapes = this.shapes.filter((sh) => sh.id !== id);
        this.notify();
    }

    recolor(type) {
        this.shapes = this.shapes.map((sh) =>
            sh.type === type ? { ...sh, color: randomHsl() } : sh
        );
        this.notify();
    }

    getCount(type) {
        return this.shapes.filter((sh) => sh.type === type).length;
    }
}

export const store = new Store();
