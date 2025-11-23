import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    private ipcRenderer: any;

    constructor() {
        if (this.isElectron) {
            this.ipcRenderer = (window as any).require('electron').ipcRenderer;
        }
    }

    get isElectron(): boolean {
        return !!(window && (window as any).process && (window as any).process.type);
    }

    close() {
        if (this.isElectron) {
            this.ipcRenderer.send('window-close');
        }
    }

    minimize() {
        if (this.isElectron) {
            this.ipcRenderer.send('window-minimize');
        }
    }

    maximize() {
        if (this.isElectron) {
            this.ipcRenderer.send('window-maximize');
        }
    }
}
